import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { syncUserRole } from '@/utils/roles';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Update user role to administrator
    const [updatedUser] = await db
      .update(usersTable)
      .set({ role: 'administrator' })
      .where(eq(usersTable.clerkId, userId))
      .returning();

    // Sync the role with Clerk
    await syncUserRole(userId);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error promoting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 