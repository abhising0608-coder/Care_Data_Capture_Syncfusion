import { NextResponse } from 'next/server';
import { updateNoteStatus } from '@/lib/mock-data';
import type { NoteStatus } from '@/lib/definitions';

export async function POST(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  const { noteId } = params;
  const { action, actorId, editorContent } = await request.json();

  if (!action || !actorId) {
    return NextResponse.json({ message: 'Action and Actor ID are required' }, { status: 400 });
  }

  let newStatus: NoteStatus;

  switch (action) {
    case 'rework':
      newStatus = 'Rework Requested';
      break;
    case 'submit-to-qc':
      newStatus = 'In Review (QC)';
      break;
    default:
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  const updatedNote = updateNoteStatus(noteId, newStatus, actorId, editorContent);

  if (!updatedNote) {
    return NextResponse.json({ message: 'Failed to update note' }, { status: 404 });
  }

  return NextResponse.json(updatedNote);
}
