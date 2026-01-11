
import { NextResponse } from 'next/server';
import { getDMSDocumentHistoryByCompanyId } from '@/lib/mock-data';
import type { DMSDocumentHistory } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  
  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  // For now, we return the same mock data regardless of companyId
  const history: DMSDocumentHistory[] = getDMSDocumentHistoryByCompanyId(companyId);

  return NextResponse.json(history);
}
