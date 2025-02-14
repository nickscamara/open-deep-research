import { auth, signIn } from "@/app/(auth)/auth";
import { customModel } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, createDataStreamResponse, generateObject, generateText, NoObjectGeneratedError, streamObject, streamText } from "ai";
import { z } from "zod";
import { scanSystemPrompt } from "./scanSystemPrompt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const {
        imageData,
    }: { imageData: string } =
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

    const openai = createOpenAI({
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        apiKey: 'sk-a21d3a2bd0104e7db1cc265195753325'
    })

    // const { object } = await generateObject({
    //     model: openai('qwen-vl-plus'),
    //     schema: z.object({
    //       recipe: z.object({
    //         name: z.string(),
    //         ingredients: z.array(z.string()),
    //         steps: z.array(z.string()),
    //       }),
    //     }),
    //     prompt: 'Generate a lasagna recipe.',
    //   });
      
    //   console.log(JSON.stringify(object, null, 2));


    try {
        const t = await generateObject({
            model: openai('qwen-vl-max'),
            // system: scanSystemPrompt,
            mode:'json',
            // prompt:`请根据这个图片${imageData},输出json`,
            messages: [{
                role: 'user',
                content: [
                    {
                        type:'text',
                        text:scanSystemPrompt
                    },
                    {
                        type: 'image',
                        image: imageData
                    },
                   
                ]
            }],
            schema: z.object({
                status: z
                    .number()
                    .describe('状态码，0代表识别成功，1代表识别失败'),
                productName: z
                    .string()
                    .describe('识别到的商品名称，格式应为“品牌名+名词A”或“颜色+名词A'),
                msg: z
                    .string()
                    .describe('当status为1时，提供详细的识别失败原因'),
                category: z
                    .string()
                    .describe('如实描述所看到物品的具体分类，例如鼠标、杯子、牙线等'),
                color: z
                    .string()
                    .describe('如实描述所看到物品的颜色，如黑色、粉色等'),
                brand: z
                    .string()
                    .describe('正确描述所看到物品的品牌名称，如三只松鼠、维达、罗技等')
            })
        });
    
        console.log(t.object,'elementStream11111')
        return NextResponse.json({
            code:0,
            success:true,
            data:t.object
        });
    } catch (error) {
      console.log(error,'error')
    }

   

    
 
}