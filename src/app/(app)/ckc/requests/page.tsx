'use client';

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const CKCRequestsClient = dynamic(() => import('@/components/ckc/requests-client'), {
  ssr: false,
  loading: () => (
     <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <div className="flex gap-4">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
        </div>
      <div className="rounded-md border bg-card p-4 space-y-4">
         <Skeleton className="h-10 w-full" />
         <Skeleton className="h-10 w-full" />
         <Skeleton className="h-10 w-full" />
         <Skeleton className="h-10 w-full" />
         <Skeleton className="h-10 w-full" />
      </div>
    </div>
  ),
})

export default function CKCRequestsPage() {
  return <CKCRequestsClient />;
}

    