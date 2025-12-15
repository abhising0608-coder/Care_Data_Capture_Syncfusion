'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingRequestsList } from './pending-requests-list';
import { AcceptedRequestsList } from './accepted-requests-list';

export function RequestsList() {
  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="accepted">Accepted</TabsTrigger>
        <TabsTrigger value="closed">Closed</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="space-y-4">
        <PendingRequestsList />
      </TabsContent>
      <TabsContent value="accepted" className="space-y-4">
        <AcceptedRequestsList />
      </TabsContent>
      <TabsContent value="closed">
        <p className="text-muted-foreground">Closed requests will appear here.</p>
      </TabsContent>
    </Tabs>
  );
}
