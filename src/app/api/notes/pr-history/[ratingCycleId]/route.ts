
import { NextResponse } from 'next/server';
import { getPressReleaseHistoryByNoteId } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  
  if (!ratingCycleId) {
    return NextResponse.json({ message: 'Note ID is required' }, { status: 400 });
  }

  const history = getPressReleaseHistoryByNoteId(ratingCycleId);

  return NextResponse.json(history);
}
