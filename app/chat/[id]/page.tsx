import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/schema';
import { and, eq, asc } from 'drizzle-orm';
import { Chat } from '../components/Chat';

interface ConversationPageProps {
  params: {
    id: string;
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const conversationId = parseInt(params.id);
  
  // First get the conversation
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.clerkId, userId)
      )
    );

  if (!conversation) {
    redirect('/chat');
  }

  // Then get the messages
  const conversationMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return (
    <Chat
      initialMessages={conversationMessages.map(msg => ({
        id: msg.id.toString(),
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt.toISOString(),
      }))}
      conversationId={conversation.id}
    />
  );
} 