import { NextResponse } from 'next/server';
import { getCkcRequests } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = getCkcRequests({ id });

  if (data.length === 0) {
    return NextResponse.json({ message: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}

    