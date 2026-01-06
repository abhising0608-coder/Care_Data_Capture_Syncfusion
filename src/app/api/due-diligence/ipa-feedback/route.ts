import { NextResponse } from 'next/server';
import { getIPAFeedbackByCompanyId, createIPARecord } from '@/lib/mock-data';
import type { IPAContact } from '@/lib/definitions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (companyId) {
    const ipaFirms = getIPAFeedbackByCompanyId(companyId);
    return NextResponse.json(ipaFirms);
  }

  return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { companyId, firmId, contactId, updates } = body;

  if (!companyId || !firmId || !contactId || !updates) {
    return NextResponse.json({ message: 'Missing required parameters for update' }, { status: 400 });
  }
  
  const result = createIPARecord(companyId, firmId, contactId, updates.discussionHappened);

  if (!result) {
      return NextResponse.json({ message: 'Failed to create/update IPA feedback' }, { status: 500 });
  }

  return NextResponse.json(result);
}
