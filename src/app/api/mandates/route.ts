
import { NextResponse } from 'next/server';
import { mockMandateData } from '@/lib/mock-data';
import type { Mandate } from '@/lib/definitions';

export async function GET(request: Request) {
  // In a real app, you'd fetch this based on a company or ratingCycleId
  return NextResponse.json(mockMandateData);
}
