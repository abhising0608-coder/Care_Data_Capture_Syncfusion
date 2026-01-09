import { NextResponse } from 'next/server';
import { getPastFinancialsByCompanyId } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const data = getPastFinancialsByCompanyId(id);

  if (!data) {
    return NextResponse.json({ message: 'Data not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

    