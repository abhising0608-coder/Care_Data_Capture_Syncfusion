
'use client';
import { Bell, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export function AppHeader() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();
  const pendingRequestsQuery = useMemoFirebase(
    () => {
      if (!firestore || isUserLoading) return null;
      return query(collection(firestore, 'ckc_operational_requests'), where('status', '==', 'PENDING'));
    },
    [firestore, isUserLoading]
  );
  const { data: pendingRequests } = useCollection(pendingRequestsQuery);

  const newRequestCount = pendingRequests?.length || 0;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold text-foreground hidden md:block">
          CareEdge Operational Data Input
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full relative">
          <Link href="/ckc-requests">
            <Bell className="h-5 w-5" />
            {newRequestCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-xs">
                {newRequestCount}
              </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
