import { auth, signIn } from '@/app/(auth)/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/queries';

async function getOrCreateSession() {
  let session = await auth();

  // If no session exists, create an anonymous session
  if (!session?.user) {
    try {
      const result = await signIn('credentials', {
        redirect: false,
      });

      if (result?.error) {
        console.error('Failed to create anonymous session:', result.error);
        return null;
      }

      session = await auth();

      if (!session?.user) {
        console.error('Failed to get session after creation');
        return null;
      }
    } catch (error) {
      console.error('Error creating anonymous session:', error);
      return null;
    }
  }

  return session;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const session = await getOrCreateSession();

  if (!session?.user) {
    return new Response('Failed to create session', { status: 500 });
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  if (type !== 'up' && type !== 'down') {
    return new Response("type must be 'up' or 'down'", { status: 400 });
  }

  const session = await getOrCreateSession();

  if (!session?.user) {
    return new Response('Failed to create session', { status: 500 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
