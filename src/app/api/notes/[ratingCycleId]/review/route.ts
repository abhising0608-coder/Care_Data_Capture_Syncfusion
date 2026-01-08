
import { NextResponse } from 'next/server';
import { updateNoteStatus, updateNote } from '@/lib/mock-data';
import type { NoteStatus, RatingNote } from '@/lib/definitions';

export async function POST(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  const { action, actorId, prContent } = await request.json();

  if (!action || !actorId) {
    return NextResponse.json({ message: 'Action and Actor ID are required' }, { status: 400 });
  }

  // Handle simple draft saving
  if (action === 'save-pr-draft') {
      const updatedNote = updateNote(ratingCycleId, { prContent });
      if (!updatedNote) {
        return NextResponse.json({ message: 'Failed to save draft' }, { status: 404 });
      }
      return NextResponse.json(updatedNote);
  }

  let newStatus: NoteStatus | undefined;
  const updates: Partial<RatingNote> = { prContent };

  switch (action) {
    // --- Rating Note Flow (Legacy) ---
    case 'submit-to-gh-rn':
      newStatus = 'In Review (GH)';
      break;

    // --- Press Release Flow ---
    case 'send-to-gh':
      newStatus = 'In Review (GH)';
      break;
    case 'approve-gh':
      newStatus = 'GH Approved' as NoteStatus;
      break;
    case 'rework-gh':
      newStatus = 'Rework Requested (GH)';
      break;
    
    case 'send-to-rh':
      newStatus = 'In Review (RH)' as NoteStatus;
      break;
    case 'approve-rh':
      newStatus = 'RH Approved' as NoteStatus;
      break;
    case 'rework-rh':
      newStatus = 'Rework Requested (RH)' as NoteStatus;
      break;
      
    case 'send-to-qc':
      newStatus = 'In Review (QC)';
      break;
    case 'approve-qc':
      newStatus = 'QC Approved' as NoteStatus;
      break;
    case 'rework-qc':
      newStatus = 'Rework Requested (QC)' as NoteStatus;
      break;
      
    case 'send-to-auditor':
      newStatus = 'In Review (Auditor)' as NoteStatus;
      break;
    case 'approve-auditor':
      newStatus = 'Auditor Approved' as NoteStatus;
      break;
    case 'rework-auditor':
      newStatus = 'Rework Requested (Auditor)' as NoteStatus;
      break;
      
    case 'send-to-editor':
      newStatus = 'In Review (Editor)' as NoteStatus;
      break;
    case 'approve-editor':
      newStatus = 'Editor Approved' as NoteStatus;
      break;
    case 'rework-editor':
      newStatus = 'Rework Requested (Editor)' as NoteStatus;
      break;
      
    case 'send-to-client':
      newStatus = 'Sent to Client';
      break;
      
    default:
      return NextResponse.json({ message: `Invalid action: ${action}` }, { status: 400 });
  }

  const updatedNote = updateNoteStatus(ratingCycleId, newStatus, actorId, updates);

  if (!updatedNote) {
    return NextResponse.json({ message: 'Failed to update note' }, { status: 404 });
  }

  return NextResponse.json(updatedNote);
}
