import { NextResponse } from 'next/server';
import { getIPAFeedbackByCompanyId, createIPARecord, getIPAFeedbackByContactId, updateIPAFeedback } from '@/lib/mock-data';
import type { IPAContact } from '@/lib/definitions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const firmId = searchParams.get('firmId');
  const contactId = searchParams.get('contactId');

  if (companyId && firmId && contactId) {
    const data = getIPAFeedbackByContactId(companyId, firmId, contactId);
    if (!data) {
      return NextResponse.json({ message: 'Feedback record not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  }


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
  
  const existingRecord = getIPAFeedbackByContactId(companyId, firmId, contactId);
  
  let result;
  if(existingRecord?.contact?.status) {
    // This is an update
    result = updateIPAFeedback(companyId, firmId, contactId, updates);
  } else {
    // This is a new record creation
     result = createIPARecord(companyId, firmId, contactId, updates.discussionHappened);
  }

  if (!result) {
      return NextResponse.json({ message: 'Failed to create/update IPA feedback' }, { status: 500 });
  }

  return NextResponse.json(result);
}
