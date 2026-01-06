import { NextResponse } from 'next/server';
import { getCompaniesByRole } from '@/lib/mock-data';
import { mockUsers } from '@/lib/mock-data';
import type { Role } from '@/lib/definitions';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') as Role | null;

  if (!role) {
    return NextResponse.json({ message: 'Role is required' }, { status: 400 });
  }

  // Find a mock user for the given role to simulate role-based access
  const mockUser = Object.values(mockUsers).find(u => u.role === role);

  if (!mockUser) {
      return NextResponse.json({ message: 'No user found for this role' }, { status: 404 });
  }
  
  const companies = getCompaniesByRole(mockUser);
  
  return NextResponse.json(companies);
}
