import { NextResponse } from 'next/server';
import { getCkcRequests } from '@/lib/mock-data';
import type { RequestStatus } from '@/lib/definitions';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as RequestStatus | null;
  const id = searchParams.get('id') as string | null;

  const data = getCkcRequests({ status, id });
  
  return NextResponse.json(data);
}
