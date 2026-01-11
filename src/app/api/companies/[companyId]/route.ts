import { NextResponse } from 'next/server';
import { getNoteById } from '@/lib/mock-data';
import type { CompanyDashboard } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  const note = getNoteById(companyId);

  if (!note) {
    return NextResponse.json({ message: 'Company not found' }, { status: 404 });
  }

  // Transform RatingNote to CompanyDashboard type
  const companyDashboard: CompanyDashboard = {
    id: note.id,
    companyName: note.companyName,
    ratingCycle: note.ratingCycle,
    priority: note.priority,
    dueDate: note.dueDate,
    status: note.status,
    raId: note.initiatedBy,
    ghId: note.ghId,
  };

  return NextResponse.json(companyDashboard);
}
