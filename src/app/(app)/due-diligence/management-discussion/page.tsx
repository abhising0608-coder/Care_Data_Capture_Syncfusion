'use client';

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const ManagementDiscussionClient = dynamic(() => import('@/components/due-diligence/management-discussion'), {
  ssr: false,
  loading: () => (
     <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
     </div>
  ),
})

export default function ManagementDiscussionPage() {
  return <ManagementDiscussionClient />;
}
