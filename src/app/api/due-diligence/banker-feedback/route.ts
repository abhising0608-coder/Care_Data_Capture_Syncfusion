import { NextResponse } from 'next/server';
import { getBankerFeedbackByCompanyId, updateBankerFeedback, createBankerRecord, getBankerFeedbackByContactId } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const firmId = searchParams.get('firmId');
  const contactId = searchParams.get('contactId');

  if (companyId && firmId && contactId) {
    const data = getBankerFeedbackByContactId(companyId, firmId, contactId);
    if (!data) {
      return NextResponse.json({ message: 'Feedback record not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  if (companyId) {
    const firms = getBankerFeedbackByCompanyId(companyId);
    return NextResponse.json(firms);
  }

  return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { companyId, firmId, contactId, updates } = body;

  if (!companyId || !firmId || !contactId || !updates) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  const result = updates.discussionHappened ? 
    createBankerRecord(companyId, firmId, contactId, updates.discussionHappened) :
    updateBankerFeedback(companyId, firmId, contactId, updates);

  if (!result) {
      return NextResponse.json({ message: 'Failed to update feedback' }, { status: 500 });
  }

  return NextResponse.json(result);
}
