import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, NewConversation } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.clerkId, userId),
      orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
    });

    return NextResponse.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { title, modelId } = await req.json();

    const newConversation: NewConversation = {
      clerkId: userId,
      title,
      modelId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [conversation] = await db.insert(conversations)
      .values(newConversation)
      .returning();

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 