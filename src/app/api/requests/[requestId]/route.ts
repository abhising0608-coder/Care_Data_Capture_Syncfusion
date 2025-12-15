import { NextResponse } from 'next/server';
import { getRequestById } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params;
  const requestData = getRequestById(requestId);

  if (!requestData) {
    return NextResponse.json({ message: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json(requestData);
}
