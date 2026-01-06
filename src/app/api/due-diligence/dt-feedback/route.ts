import { NextResponse } from 'next/server';
import { getDTFeedbackByCompanyId, updateDTFeedback } from '@/lib/mock-data';
import type { DTContact } from '@/lib/definitions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const dtFirms = getDTFeedbackByCompanyId(companyId);

  return NextResponse.json(dtFirms);
}

export async function POST(request: Request) {
  const { companyId, firmId, contactId, updates } = await request.json() as { 
      companyId: string, 
      firmId: string, 
      contactId: string, 
      updates: Partial<DTContact> 
  };

  if (!companyId || !firmId || !contactId || !updates) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }
  
  const updatedContact = updateDTFeedback(companyId, firmId, contactId, updates);

  if (!updatedContact) {
      return NextResponse.json({ message: 'Failed to update feedback' }, { status: 500 });
  }

  return NextResponse.json(updatedContact);
}
