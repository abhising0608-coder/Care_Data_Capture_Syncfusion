
import { NextResponse } from 'next/server';
import { updateNoteStatus, updateNote } from '@/lib/mock-data';
import type { NoteStatus, RatingNote } from '@/lib/definitions';

export async function POST(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  const { noteId } = params;
  const { action, actorId, editorContent, prContent } = await request.json();

  if (!action || !actorId) {
    return NextResponse.json({ message: 'Action and Actor ID are required' }, { status: 400 });
  }
  
  if (action === 'save-draft') {
      const updatedNote = updateNote(noteId, { editorContent });
      if (!updatedNote) {
        return NextResponse.json({ message: 'Failed to save draft' }, { status: 404 });
      }
      return NextResponse.json(updatedNote);
  }

  let newStatus: NoteStatus;
  let updates: Partial<RatingNote> = { editorContent };


  switch (action) {
    case 'submit-to-gh':
        newStatus = 'In Review (GH)';
        break;
    case 'submit-to-qc':
      newStatus = 'In Review (QC)';
      break;
    case 'send-to-ra-for-pr':
      newStatus = 'PR Generation Pending';
      break;
    case 'submit-pr':
        newStatus = 'PR Generated';
        if (prContent) updates.prContent = prContent;
        break;
    default:
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  const updatedNote = updateNoteStatus(noteId, newStatus, actorId, updates);

  if (!updatedNote) {
    return NextResponse.json({ message: 'Failed to update note' }, { status: 404 });
  }

  return NextResponse.json(updatedNote);
}
