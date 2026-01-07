
import { NextResponse } from 'next/server';
import { getNotesByRole, createNote } from '@/lib/mock-data';
import type { Role } from '@/lib/definitions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') as Role | null;
  const userId = searchParams.get('userId') as string | null;

  if (!role || !userId) {
    return NextResponse.json({ message: 'Role and User ID are required' }, { status: 400 });
  }
  
  const notes = getNotesByRole(role, userId);
  
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
    const body = await request.json();
    
    const newNote = createNote(body);

    if (!newNote) {
        return NextResponse.json({ message: 'Failed to create new note' }, { status: 500 });
    }

    return NextResponse.json(newNote, { status: 201 });
}
