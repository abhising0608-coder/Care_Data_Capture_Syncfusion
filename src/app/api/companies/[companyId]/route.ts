
import { NextResponse } from 'next/server';
import { getNoteById, getCompanyById } from '@/lib/mock-data';
import type { CompanyDashboard } from '@/lib/definitions';

export async function GET(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID is required' }, { status: 400 });
  }

  // First try to find by rating note ID (which acts as ratingCycleId)
  const note = getNoteById(companyId);
  if (note) {
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

  // Fallback to searching by direct companyId if not found as a rating note
  const company = getCompanyById(companyId);
   if (!company) {
    return NextResponse.json({ message: 'Company not found' }, { status: 404 });
  }

   const companyDashboard: CompanyDashboard = {
    id: company.id,
    companyName: company.companyName,
    // These fields might need default or derived values if not directly available on company object
    ratingCycle: 'Initial', 
    priority: 'Medium',
    dueDate: 'N/A',
    status: 'Draft',
    raId: company.ratingAnalystId,
    ghId: company.groupHeadId,
  };


  return NextResponse.json(companyDashboard);
}
