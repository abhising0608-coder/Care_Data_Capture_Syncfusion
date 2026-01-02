import { NextResponse } from 'next/server';
import { getNotesByRole, updateNoteStatus } from '@/lib/mock-data';
import type { Role, NoteStatus } from '@/lib/definitions';

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
    const { noteId, newStatus, actorId, editorContent } = await request.json();

    if (!noteId || !newStatus || !actorId) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const updatedNote = updateNoteStatus(noteId, newStatus as NoteStatus, actorId, editorContent);

    if (!updatedNote) {
        return NextResponse.json({ message: 'Failed to update note status' }, { status: 500 });
    }

    return NextResponse.json(updatedNote);
}
