import { NextResponse } from 'next/server';
import { acceptRequest } from '@/lib/mock-data';

export async function POST(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params;
  const body = await request.json();
  const { userId, userName } = body;

  if (!userId || !userName) {
    return NextResponse.json({ message: 'User ID and Name are required' }, { status: 400 });
  }

  const updatedRequest = acceptRequest(requestId, userId, userName);

  if (!updatedRequest) {
    return NextResponse.json({ message: 'Request not found or could not be updated' }, { status: 404 });
  }

  return NextResponse.json(updatedRequest);
}
