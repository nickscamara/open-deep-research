import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateObject,
  generateText,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { auth, signIn } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { rateLimiter } from '@/lib/rate-limit';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import FirecrawlApp from '@mendable/firecrawl-js';

export const maxDuration = 300;

type AllowedTools =
  | 'requestSuggestions'
  | 'deepResearch'
  | 'search'
  | 'extract'
  | 'scrape';

const blocksTools: AllowedTools[] = ['requestSuggestions'];

const firecrawlTools: AllowedTools[] = ['search', 'extract', 'scrape'];

const allTools: AllowedTools[] = [...firecrawlTools, 'deepResearch'];

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || '',
});

const reasoningModel = customModel(process.env.REASONING_MODEL || 'o1-mini', true);

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  let session = await auth();

  // If no session exists, create an anonymous session
  if (!session?.user) {
    try {
      const result = await signIn('credentials', {
        redirect: false,
      });

      if (result?.error) {
        console.error('Failed to create anonymous session:', result.error);
        return new Response('Failed to create anonymous session', {
          status: 500,
        });
      }

      session = await auth();

      if (!session?.user) {
        console.error('Failed to get session after creation');
        return new Response('Failed to create session', { status: 500 });
      }
    } catch (error) {
      console.error('Error creating anonymous session:', error);
      return new Response('Failed to create anonymous session', {
        status: 500,
      });
    }
  }

  if (!session?.user?.id) {
    return new Response('Failed to create session', { status: 500 });
  }

  // Apply rate limiting
  const identifier = session.user.id;
  const { success, limit, reset, remaining } =
    await rateLimiter.limit(identifier);

  if (!success) {
    return new Response(`Too many requests`, { status: 429 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  const userMessageId = generateUUID();

  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 10,
        experimental_activeTools: allTools,
        tools: {
          createDocument: {
            description:
              'Create a document for a writing activity. This tool will call other functions that will generate the contents of the document based on the title and kind.',
            parameters: z.object({
              title: z.string(),
              kind: z.enum(['text', 'code', 'spreadsheet']),
            }),
            execute: async ({ title, kind }) => {
              const id = generateUUID();
              let draftText = '';

              dataStream.writeData({
                type: 'id',
                content: id,
              });

              dataStream.writeData({
                type: 'title',
                content: title,
              });

              dataStream.writeData({
                type: 'kind',
                content: kind,
              });

              dataStream.writeData({
                type: 'clear',
                content: '',
              });

              if (kind === 'text') {
                const { fullStream } = streamText({
                  model: customModel(model.apiIdentifier),
                  system:
                    'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
                  prompt: title,
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'text-delta') {
                    const { textDelta } = delta;

                    draftText += textDelta;
                    dataStream.writeData({
                      type: 'text-delta',
                      content: textDelta,
                    });
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              } else if (kind === 'code') {
                const { fullStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system: codePrompt,
                  prompt: title,
                  schema: z.object({
                    code: z.string(),
                  }),
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'object') {
                    const { object } = delta;
                    const { code } = object;

                    if (code) {
                      dataStream.writeData({
                        type: 'code-delta',
                        content: code ?? '',
                      });

                      draftText = code;
                    }
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              } else if (kind === 'spreadsheet') {
                const { fullStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system: `You are a spreadsheet initialization assistant. Create a spreadsheet structure based on the title/description and the chat history.
                    - Create meaningful column headers based on the context and chat history
                    - Keep data types consistent within columns
                    - If the title doesn't suggest specific columns, create a general-purpose structure`,
                  prompt:
                    title +
                    '\n\nChat History:\n' +
                    coreMessages.map((msg) => msg.content).join('\n'),
                  schema: z.object({
                    headers: z
                      .array(z.string())
                      .describe('Column headers for the spreadsheet'),
                    rows: z.array(z.array(z.string())).describe('Data rows'),
                  }),
                });

                let spreadsheetData: { headers: string[]; rows: string[][] } = {
                  headers: [],
                  rows: [[], []],
                };

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'object') {
                    const { object } = delta;
                    if (
                      object &&
                      Array.isArray(object.headers) &&
                      Array.isArray(object.rows)
                    ) {
                      // Validate and normalize the data
                      const headers = object.headers.map((h) =>
                        String(h || ''),
                      );
                      const rows = object.rows.map((row) => {
                        // Handle undefined row by creating empty array
                        const safeRow = (row || []).map((cell) =>
                          String(cell || ''),
                        );
                        // Ensure row length matches headers
                        while (safeRow.length < headers.length)
                          safeRow.push('');
                        return safeRow.slice(0, headers.length);
                      });

                      spreadsheetData = { headers, rows };
                    }
                  }
                }

                draftText = JSON.stringify(spreadsheetData);
                dataStream.writeData({
                  type: 'spreadsheet-delta',
                  content: draftText,
                });

                dataStream.writeData({ type: 'finish', content: '' });
              }

              if (session.user?.id) {
                await saveDocument({
                  id,
                  title,
                  kind,
                  content: draftText,
                  userId: session.user.id,
                });
              }

              return {
                id,
                title,
                kind,
                content:
                  'A document was created and is now visible to the user.',
              };
            },
          },
          updateDocument: {
            description: 'Update a document with the given description.',
            parameters: z.object({
              id: z.string().describe('The ID of the document to update'),
              description: z
                .string()
                .describe('The description of changes that need to be made'),
            }),
            execute: async ({ id, description }) => {
              const document = await getDocumentById({ id });

              if (!document) {
                return {
                  error: 'Document not found',
                };
              }

              const { content: currentContent } = document;
              let draftText = '';

              dataStream.writeData({
                type: 'clear',
                content: document.title,
              });

              if (document.kind === 'text') {
                const { fullStream } = streamText({
                  model: customModel(model.apiIdentifier),
                  system: updateDocumentPrompt(currentContent, 'text'),
                  prompt: description,
                  experimental_providerMetadata: {
                    openai: {
                      prediction: {
                        type: 'content',
                        content: currentContent,
                      },
                    },
                  },
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'text-delta') {
                    const { textDelta } = delta;

                    draftText += textDelta;
                    dataStream.writeData({
                      type: 'text-delta',
                      content: textDelta,
                    });
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              } else if (document.kind === 'code') {
                const { fullStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system: updateDocumentPrompt(currentContent, 'code'),
                  prompt: description,
                  schema: z.object({
                    code: z.string(),
                  }),
                });

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'object') {
                    const { object } = delta;
                    const { code } = object;

                    if (code) {
                      dataStream.writeData({
                        type: 'code-delta',
                        content: code ?? '',
                      });

                      draftText = code;
                    }
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              } else if (document.kind === 'spreadsheet') {
                // Parse the current content as spreadsheet data
                let currentSpreadsheetData = { headers: [], rows: [] };
                try {
                  if (currentContent) {
                    currentSpreadsheetData = JSON.parse(currentContent);
                  }
                } catch {
                  // Keep default empty structure
                }

                const { fullStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system: `You are a spreadsheet manipulation assistant. The current spreadsheet has the following structure:
                    Headers: ${JSON.stringify(currentSpreadsheetData.headers)}
                    Current rows: ${JSON.stringify(currentSpreadsheetData.rows)}
                    
                    When modifying the spreadsheet:
                    1. You can add, remove, or modify columns (headers)
                    2. When adding columns, add empty values to existing rows for the new columns
                    3. When removing columns, remove the corresponding values from all rows
                    4. Return the COMPLETE spreadsheet data including ALL headers and rows
                    5. Format response as valid JSON with 'headers' and 'rows' arrays
                    
                    Example response format:
                    {"headers":["Name","Email","Phone"],"rows":[["John","john@example.com","123-456-7890"],["Jane","jane@example.com","098-765-4321"]]}`,
                  prompt: `${description}\n\nChat History:\n${coreMessages
                    .map((msg) => msg.content)
                    .join('\n')}`,
                  schema: z.object({
                    headers: z
                      .array(z.string())
                      .describe('Column headers for the spreadsheet'),
                    rows: z
                      .array(z.array(z.string()))
                      .describe('Sample data rows'),
                  }),
                });

                let updatedContent = '';
                draftText = JSON.stringify(currentSpreadsheetData);

                for await (const delta of fullStream) {
                  const { type } = delta;

                  if (type === 'object') {
                    const { object } = delta;
                    if (
                      object &&
                      Array.isArray(object.headers) &&
                      Array.isArray(object.rows)
                    ) {
                      // Validate and normalize the data
                      const headers = object.headers.map((h: any) =>
                        String(h || ''),
                      );
                      const rows = object.rows.map(
                        (row: (string | undefined)[] | undefined) => {
                          const normalizedRow = (row || []).map((cell: any) =>
                            String(cell || ''),
                          );
                          // Ensure row length matches new headers length
                          while (normalizedRow.length < headers.length) {
                            normalizedRow.push('');
                          }
                          return normalizedRow.slice(0, headers.length);
                        },
                      );

                      const newData = { headers, rows };
                      draftText = JSON.stringify(newData);
                      dataStream.writeData({
                        type: 'spreadsheet-delta',
                        content: draftText,
                      });
                    }
                  }
                }

                dataStream.writeData({ type: 'finish', content: '' });
              }

              if (session.user?.id) {
                await saveDocument({
                  id,
                  title: document.title,
                  content: draftText,
                  kind: document.kind,
                  userId: session.user.id,
                });
              }

              return {
                id,
                title: document.title,
                kind: document.kind,
                content: 'The document has been updated successfully.',
              };
            },
          },
          requestSuggestions: {
            description: 'Request suggestions for a document',
            parameters: z.object({
              documentId: z
                .string()
                .describe('The ID of the document to request edits'),
            }),
            execute: async ({ documentId }) => {
              const document = await getDocumentById({ id: documentId });

              if (!document || !document.content) {
                return {
                  error: 'Document not found',
                };
              }

              const suggestions: Array<
                Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
              > = [];

              const { elementStream } = streamObject({
                model: customModel(model.apiIdentifier),
                system:
                  'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
                prompt: document.content,
                output: 'array',
                schema: z.object({
                  originalSentence: z
                    .string()
                    .describe('The original sentence'),
                  suggestedSentence: z
                    .string()
                    .describe('The suggested sentence'),
                  description: z
                    .string()
                    .describe('The description of the suggestion'),
                }),
              });

              for await (const element of elementStream) {
                const suggestion = {
                  originalText: element.originalSentence,
                  suggestedText: element.suggestedSentence,
                  description: element.description,
                  id: generateUUID(),
                  documentId: documentId,
                  isResolved: false,
                };

                dataStream.writeData({
                  type: 'suggestion',
                  content: suggestion,
                });

                suggestions.push(suggestion);
              }

              if (session.user?.id) {
                const userId = session.user.id;

                await saveSuggestions({
                  suggestions: suggestions.map((suggestion) => ({
                    ...suggestion,
                    userId,
                    createdAt: new Date(),
                    documentCreatedAt: document.createdAt,
                  })),
                });
              }

              return {
                id: documentId,
                title: document.title,
                kind: document.kind,
                message: 'Suggestions have been added to the document',
              };
            },
          },
          search: {
            description:
              "Search for web pages. Normally you should call the extract tool after this one to get a spceific data point if search doesn't the exact data you need.",
            parameters: z.object({
              query: z
                .string()
                .describe('Search query to find relevant web pages'),
              maxResults: z
                .number()
                .optional()
                .describe('Maximum number of results to return (default 10)'),
            }),
            execute: async ({ query, maxResults = 5 }) => {
              try {
                const searchResult = await app.search(query);

                if (!searchResult.success) {
                  return {
                    error: `Search failed: ${searchResult.error}`,
                    success: false,
                  };
                }

                return {
                  data: searchResult.data,
                  success: true,
                };
              } catch (error: any) {
                return {
                  error: `Search failed: ${error.message}`,
                  success: false,
                };
              }
            },
          },
          extract: {
            description:
              'Extract structured data from web pages. Use this to get whatever data you need from a URL. Any time someone needs to gather data from something, use this tool.',
            parameters: z.object({
              urls: z.array(z.string()).describe(
                'Array of URLs to extract data from',
                // , include a /* at the end of each URL if you think you need to search for other pages insides that URL to extract the full data from',
              ),
              prompt: z
                .string()
                .describe('Description of what data to extract'),
            }),
            execute: async ({ urls, prompt }) => {
              try {
                const scrapeResult = await app.extract(urls, {
                  prompt,
                });

                if (!scrapeResult.success) {
                  return {
                    error: `Failed to extract data: ${scrapeResult.error}`,
                    success: false,
                  };
                }

                return {
                  data: scrapeResult.data,
                  success: true,
                };
              } catch (error: any) {
                console.error('Extraction error:', error);
                console.error(error.message);
                console.error(error.error);
                return {
                  error: `Extraction failed: ${error.message}`,
                  success: false,
                };
              }
            },
          },
          scrape: {
            description:
              'Scrape web pages. Use this to get from a page when you have the url.',
            parameters: z.object({
              url: z.string().describe('URL to scrape'),
            }),
            execute: async ({ url }: { url: string }) => {
              try {
                const scrapeResult = await app.scrapeUrl(url);

                if (!scrapeResult.success) {
                  return {
                    error: `Failed to extract data: ${scrapeResult.error}`,
                    success: false,
                  };
                }

                return {
                  data:
                    scrapeResult.markdown ??
                    'Could get the page content, try using search or extract',
                  success: true,
                };
              } catch (error: any) {
                console.error('Extraction error:', error);
                console.error(error.message);
                console.error(error.error);
                return {
                  error: `Extraction failed: ${error.message}`,
                  success: false,
                };
              }
            },
          },
          deepResearch: {
            description:
              'Perform deep research on a topic using an AI agent that coordinates search, extract, and analysis tools with reasoning steps.',
            parameters: z.object({
              topic: z.string().describe('The topic or question to research'),
            }),
            execute: async ({ topic, maxDepth = 7 }) => {
              const startTime = Date.now();
              const timeLimit = 4.5 * 60 * 1000; // 4 minutes 30 seconds in milliseconds

              const researchState = {
                findings: [] as Array<{ text: string; source: string }>,
                summaries: [] as Array<string>,
                nextSearchTopic: '',
                urlToSearch: '',
                currentDepth: 0,
                failedAttempts: 0,
                maxFailedAttempts: 3,
                completedSteps: 0,
                totalExpectedSteps: maxDepth * 5,
              };

              // Initialize progress tracking
              dataStream.writeData({
                type: 'progress-init',
                content: {
                  maxDepth,
                  totalSteps: researchState.totalExpectedSteps,
                },
              });

              const addSource = (source: {
                url: string;
                title: string;
                description: string;
              }) => {
                dataStream.writeData({
                  type: 'source-delta',
                  content: source,
                });
              };

              const addActivity = (activity: {
                type:
                  | 'search'
                  | 'extract'
                  | 'analyze'
                  | 'reasoning'
                  | 'synthesis'
                  | 'thought';
                status: 'pending' | 'complete' | 'error';
                message: string;
                timestamp: string;
                depth: number;
              }) => {
                if (activity.status === 'complete') {
                  researchState.completedSteps++;
                }

                dataStream.writeData({
                  type: 'activity-delta',
                  content: {
                    ...activity,
                    depth: researchState.currentDepth,
                    completedSteps: researchState.completedSteps,
                    totalSteps: researchState.totalExpectedSteps,
                  },
                });
              };

              const analyzeAndPlan = async (
                findings: Array<{ text: string; source: string }>,
              ) => {
                try {
                  const timeElapsed = Date.now() - startTime;
                  const timeRemaining = timeLimit - timeElapsed;
                  const timeRemainingMinutes =
                    Math.round((timeRemaining / 1000 / 60) * 10) / 10;

                  const result = await generateObject({
                    model: customModel(model.apiIdentifier, true),
                    schema: z.object({
                      analysis: z.object({
                        summary: z.string(),
                        gaps: z.array(z.string()),
                        nextSteps: z.array(z.string()),
                        shouldContinue: z.boolean(),
                        nextSearchTopic: z.string().optional(),
                        urlToSearch: z.string().optional(),
                      }),
                    }),
                    prompt: `You are a research agent analyzing findings about: ${topic}
                            You have ${timeRemainingMinutes} minutes remaining to complete the research but you don't need to use all of it.
                            Current findings: ${findings
                              .map((f) => `[From ${f.source}]: ${f.text}`)
                              .join('\n')}
                            What has been learned? What gaps remain? What specific aspects should be investigated next if any?
                            If you need to search for more information, set nextSearchTopic.
                            If you need to search for more information in a specific URL, set urlToSearch.
                            Important: If less than 1 minute remains, set shouldContinue to false to allow time for final synthesis.
                            If I have enough information, set shouldContinue to false.`,
                  });
                  return result.object.analysis;
                } catch (error) {
                  console.error('Analysis error:', error);
                  return null;
                }
              };

              const extractFromUrls = async (urls: string[]) => {
                const extractPromises = urls.map(async (url) => {
                  try {
                    addActivity({
                      type: 'extract',
                      status: 'pending',
                      message: `Analyzing ${new URL(url).hostname}`,
                      timestamp: new Date().toISOString(),
                      depth: researchState.currentDepth,
                    });

                    const result = await app.extract([url], {
                      prompt: `Extract key information about ${topic}. Focus on facts, data, and expert opinions.`,
                    });

                    if (result.success) {
                      addActivity({
                        type: 'extract',
                        status: 'complete',
                        message: `Extracted from ${new URL(url).hostname}`,
                        timestamp: new Date().toISOString(),
                        depth: researchState.currentDepth,
                      });

                      if (Array.isArray(result.data)) {
                        return result.data.map((item) => ({
                          text: item.data,
                          source: url,
                        }));
                      }
                      return [{ text: result.data, source: url }];
                    }
                    return [];
                  } catch (error) {
                    // console.warn(`Extraction failed for ${url}:`);
                    return [];
                  }
                });

                const results = await Promise.all(extractPromises);
                return results.flat();
              };

              try {
                while (researchState.currentDepth < maxDepth) {
                  const timeElapsed = Date.now() - startTime;
                  if (timeElapsed >= timeLimit) {
                    break;
                  }

                  researchState.currentDepth++;

                  dataStream.writeData({
                    type: 'depth-delta',
                    content: {
                      current: researchState.currentDepth,
                      max: maxDepth,
                      completedSteps: researchState.completedSteps,
                      totalSteps: researchState.totalExpectedSteps,
                    },
                  });

                  // Search phase
                  addActivity({
                    type: 'search',
                    status: 'pending',
                    message: `Searching for "${topic}"`,
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  let searchTopic = researchState.nextSearchTopic || topic;
                  const searchResult = await app.search(searchTopic);

                  if (!searchResult.success) {
                    addActivity({
                      type: 'search',
                      status: 'error',
                      message: `Search failed for "${searchTopic}"`,
                      timestamp: new Date().toISOString(),
                      depth: researchState.currentDepth,
                    });

                    researchState.failedAttempts++;
                    if (
                      researchState.failedAttempts >=
                      researchState.maxFailedAttempts
                    ) {
                      break;
                    }
                    continue;
                  }

                  addActivity({
                    type: 'search',
                    status: 'complete',
                    message: `Found ${searchResult.data.length} relevant results`,
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  // Add sources from search results
                  searchResult.data.forEach((result: any) => {
                    addSource({
                      url: result.url,
                      title: result.title,
                      description: result.description,
                    });
                  });

                  // Extract phase
                  const topUrls = searchResult.data
                    .slice(0, 3)
                    .map((result: any) => result.url);

                  const newFindings = await extractFromUrls([
                    researchState.urlToSearch,
                    ...topUrls,
                  ]);
                  researchState.findings.push(...newFindings);

                  // Analysis phase
                  addActivity({
                    type: 'analyze',
                    status: 'pending',
                    message: 'Analyzing findings',
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  const analysis = await analyzeAndPlan(researchState.findings);
                  researchState.nextSearchTopic =
                    analysis?.nextSearchTopic || '';
                  researchState.urlToSearch = analysis?.urlToSearch || '';
                  researchState.summaries.push(analysis?.summary || '');

                  console.log(analysis);
                  if (!analysis) {
                    addActivity({
                      type: 'analyze',
                      status: 'error',
                      message: 'Failed to analyze findings',
                      timestamp: new Date().toISOString(),
                      depth: researchState.currentDepth,
                    });

                    researchState.failedAttempts++;
                    if (
                      researchState.failedAttempts >=
                      researchState.maxFailedAttempts
                    ) {
                      break;
                    }
                    continue;
                  }

                  addActivity({
                    type: 'analyze',
                    status: 'complete',
                    message: analysis.summary,
                    timestamp: new Date().toISOString(),
                    depth: researchState.currentDepth,
                  });

                  if (!analysis.shouldContinue || analysis.gaps.length === 0) {
                    break;
                  }

                  topic = analysis.gaps.shift() || topic;
                }

                // Final synthesis
                addActivity({
                  type: 'synthesis',
                  status: 'pending',
                  message: 'Preparing final analysis',
                  timestamp: new Date().toISOString(),
                  depth: researchState.currentDepth,
                });

                const finalAnalysis = await generateText({
                  model: reasoningModel,
                  maxTokens: 16000,
                  prompt: `Create a comprehensive long analysis of ${topic} based on these findings:
                          ${researchState.findings
                            .map((f) => `[From ${f.source}]: ${f.text}`)
                            .join('\n')}
                          ${researchState.summaries
                            .map((s) => `[Summary]: ${s}`)
                            .join('\n')}
                          Provide key insights, conclusions, and any remaining uncertainties. Include citations to sources where appropriate. This analysis should be very comprehensive and full of details. It is expected to be long.`,
                });

                addActivity({
                  type: 'synthesis',
                  status: 'complete',
                  message: 'Research completed',
                  timestamp: new Date().toISOString(),
                  depth: researchState.currentDepth,
                });

                dataStream.writeData({
                  type: 'finish',
                  content: finalAnalysis.text,
                });

                return {
                  success: true,
                  data: {
                    findings: researchState.findings,
                    analysis: finalAnalysis.text,
                    completedSteps: researchState.completedSteps,
                    totalSteps: researchState.totalExpectedSteps,
                  },
                };
              } catch (error: any) {
                console.error('Deep research error:', error);

                addActivity({
                  type: 'thought',
                  status: 'error',
                  message: `Research failed: ${error.message}`,
                  timestamp: new Date().toISOString(),
                  depth: researchState.currentDepth,
                });

                return {
                  success: false,
                  error: error.message,
                  data: {
                    findings: researchState.findings,
                    completedSteps: researchState.completedSteps,
                    totalSteps: researchState.totalExpectedSteps,
                  },
                };
              }
            },
          },
        },
        onFinish: async ({ response }) => {
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    const messageId = generateUUID();

                    if (message.role === 'assistant') {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }

                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  },
                ),
              });
            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  let session = await auth();

  // If no session exists, create an anonymous session
  if (!session?.user) {
    await signIn('credentials', {
      redirect: false,
    });
    session = await auth();
  }

  if (!session?.user?.id) {
    return new Response('Failed to create session', { status: 500 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
