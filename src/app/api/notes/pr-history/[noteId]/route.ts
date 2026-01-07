import { NextResponse } from 'next/server';
import { getPressReleaseHistoryByNoteId } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  const { noteId } = params;
  
  if (!noteId) {
    return NextResponse.json({ message: 'Note ID is required' }, { status: 400 });
  }

  const history = getPressReleaseHistoryByNoteId(noteId);

  return NextResponse.json(history);
}
