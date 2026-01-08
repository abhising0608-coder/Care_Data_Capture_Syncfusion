
import { NextResponse } from 'next/server';
import { updateNoteStatus } from '@/lib/mock-data';
import type { NoteStatus } from '@/lib/definitions';

export async function POST(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  const { action, actorId } = await request.json();

  if (!action || !actorId) {
    return NextResponse.json({ message: 'Action and Actor ID are required' }, { status: 400 });
  }

  let newStatus: NoteStatus;

  switch (action) {
    case 'rework-gh':
      newStatus = 'Rework Requested (GH)';
      break;
    case 'approve-submit':
      newStatus = 'CC Approved';
      break;
    default:
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  const updatedNote = updateNoteStatus(ratingCycleId, newStatus, actorId);

  if (!updatedNote) {
    return NextResponse.json({ message: 'Failed to update note' }, { status: 404 });
  }

  return NextResponse.json(updatedNote);
}
