import { NextResponse } from 'next/server';
import { getRequests } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const id = searchParams.get('id') || undefined;
  
  const requests = getRequests(status, id);
  
  return NextResponse.json(requests);
}
