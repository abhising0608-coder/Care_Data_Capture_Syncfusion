'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingRequestsList } from './pending-requests-list';
import { AcceptedRequestsList } from './accepted-requests-list';
import { ClosedRequestsList } from './closed-requests-list';
import { AuthProvider } from '@/context/auth-context';

export function RequestsList() {
  return (
    <AuthProvider>
      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent p-0 border-b rounded-none gap-4">
            <TabsTrigger value="pending" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-0">Pending</TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-0">Accepted</TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-0">Closed</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="pending" className="space-y-4">
          <PendingRequestsList />
        </TabsContent>
        <TabsContent value="accepted" className="space-y-4">
          <AcceptedRequestsList />
        </TabsContent>
        <TabsContent value="closed" className="space-y-4">
          <ClosedRequestsList />
        </TabsContent>
      </Tabs>
    </AuthProvider>
  );
}
