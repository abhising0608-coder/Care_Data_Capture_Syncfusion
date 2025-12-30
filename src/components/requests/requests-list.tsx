'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingRequestsList } from './pending-requests-list';
import { AcceptedRequestsList } from './accepted-requests-list';
import { ClosedRequestsList } from './closed-requests-list';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function RequestsList() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of all operational data requests.</p>
      </header>
      <Tabs defaultValue="pending" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent p-0 border-b-0 rounded-none gap-4">
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
    </div>
  );
}
