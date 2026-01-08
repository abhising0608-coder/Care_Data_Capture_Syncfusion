
import { NextResponse } from 'next/server';
import { getNoteById, updateNote } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  const noteData = getNoteById(ratingCycleId);

  if (!noteData) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json(noteData);
}

export async function POST(
  request: Request,
  { params }: { params: { ratingCycleId: string } }
) {
  const { ratingCycleId } = params;
  const body = await request.json();

  const updatedData = updateNote(ratingCycleId, body);
  if (!updatedData) {
     return NextResponse.json({ message: 'Note not found or update failed' }, { status: 404 });
  }

  return NextResponse.json(updatedData, { status: 200 });
}
