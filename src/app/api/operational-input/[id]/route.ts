import { NextResponse } from 'next/server';
import { getOperationalInput, saveOperationalInput } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const data = getOperationalInput(id);

  if (!data) {
    // Return an empty object or a default structure if not found
    return NextResponse.json({ id, initiation: {} });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
    const { id } = params;
    const body = await request.json();

    const updatedData = saveOperationalInput(id, body);

    return NextResponse.json(updatedData);
}
