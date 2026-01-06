import { NextResponse } from 'next/server';
import { getDTFeedbackByCompanyId, updateDTFeedback, createDTRecord, getDTFeedbackByContactId } from '@/lib/mock-data';
import type { DTContact } from '@/lib/definitions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const firmId = searchParams.get('firmId');
  const contactId = searchParams.get('contactId');

  if (companyId && firmId && contactId) {
    const data = getDTFeedbackByContactId(companyId, firmId, contactId);
    if (!data) {
      return NextResponse.json({ message: 'Feedback record not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  if (companyId) {
    const dtFirms = getDTFeedbackByCompanyId(companyId);
    return NextResponse.json(dtFirms);
  }

  return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { companyId, firmId, contactId, updates } = body;

  if (!companyId || !firmId || !contactId || !updates) {
    return NextResponse.json({ message: 'Missing required parameters for update' }, { status: 400 });
  }
  
  const existingRecord = getDTFeedbackByContactId(companyId, firmId, contactId);

  let result;
  if(existingRecord && existingRecord.contact.status) {
    result = updateDTFeedback(companyId, firmId, contactId, updates);
  } else {
    result = createDTRecord(companyId, firmId, contactId, updates.discussionHappened as 'Yes' | 'No');
  }


  if (!result) {
      return NextResponse.json({ message: 'Failed to update or create feedback' }, { status: 500 });
  }

  return NextResponse.json(result);
}
