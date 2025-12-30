'use client';

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardClient = dynamic(() => import('@/components/dashboard/dashboard-client'), {
  ssr: false,
  loading: () => (
     <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="flex items-center py-4">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
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

export default function DashboardPage() {
  return <DashboardClient />;
}
