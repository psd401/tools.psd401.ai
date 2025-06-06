import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { ideasTable, ideaNotesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hasRole } from '@/utils/roles';

export async function GET(request: Request, context: { params: { id: string } }) {
  // Protect route from unauthenticated users
  const { userId } = await auth.protect();

  try {
    const { id } = await Promise.resolve(context.params);
    const ideaId = parseInt(id);
    if (isNaN(ideaId)) {
      return new NextResponse('Invalid idea ID', { status: 400 });
    }

    // Get all notes for the idea
    const notes = await db.select()
      .from(ideaNotesTable)
      .where(eq(ideaNotesTable.ideaId, ideaId))
      .orderBy(ideaNotesTable.createdAt);

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request, context: { params: { id: string } }) {
  // Protect route from unauthenticated users
  const { userId } = await auth.protect();

  // Only staff or admin can add notes
  const [isStaff, isAdmin] = await Promise.all([
    hasRole(userId, 'staff'),
    hasRole(userId, 'administrator')
  ]);
  if (!isStaff && !isAdmin) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const { id } = await Promise.resolve(context.params);
    const ideaId = parseInt(id);
    if (isNaN(ideaId)) {
      return new NextResponse('Invalid idea ID', { status: 400 });
    }

    // Check if idea exists
    const idea = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, ideaId))
      .limit(1);

    if (idea.length === 0) {
      return new NextResponse('Idea not found', { status: 404 });
    }

    const { content } = await request.json();
    if (!content) {
      return new NextResponse('Missing content', { status: 400 });
    }

    // Create note
    const [newNote] = await db.insert(ideaNotesTable)
      .values({
        ideaId,
        content,
        createdBy: userId,
        createdAt: new Date()
      })
      .returning();

    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 