'use client';

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const AuditCommitteeClient = dynamic(() => import('@/components/due-diligence/audit-committee-meeting'), {
  ssr: false,
  loading: () => (
     <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
     </div>
  ),
})

export default function AuditCommitteeMeetingPage() {
  return <AuditCommitteeClient />;
}
