'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mockPortfolioActivities } from '@/lib/mock-data';
import type { PortfolioActivity, ActivityStatus } from '@/lib/definitions';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const statusVariant = (status: ActivityStatus) => {
    switch (status) {
        case 'Completed':
            return 'success';
        case 'In Progress':
            return 'warning';
        case 'Not Initiated':
        default:
            return 'secondary';
    }
}

const actionVariant = (action: PortfolioActivity['action']) => {
    return action === 'Attach RN' ? 'default' : 'link';
}

const ActivityRow = ({ activity }: { activity: PortfolioActivity }) => (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0">
        <div className="flex items-center gap-2">
            <Link href="#" className="text-sm font-medium text-primary hover:underline">
                {activity.name}
            </Link>
             {activity.name === 'Rating Model' && <Badge className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center p-0">W</Badge>}
        </div>
        <div className="flex items-center gap-4">
             <Badge variant={statusVariant(activity.status) as any}>{activity.status}</Badge>
            {activity.action && (
                <Button variant={actionVariant(activity.action)} size="sm">
                    {activity.action}
                </Button>
            )}
        </div>
    </div>
);


export function ActivitiesList() {
  const { data, isLoading } = useSWR('portfolio-activities', () => Promise.resolve(mockPortfolioActivities), { revalidateOnFocus: false });

  if (isLoading) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-12 w-full" />
               <Skeleton className="h-32 w-full" />
          </div>
      )
  }

  return (
     <div className="mt-4 border rounded-lg">
        <div className="grid grid-cols-[1fr_120px_120px] items-center p-3 font-semibold text-muted-foreground bg-muted/50 border-b">
            <span>Activities</span>
            <span className="text-center">Status</span>
            <span className="text-center">Action</span>
        </div>
        <Accordion type="multiple" defaultValue={['pre-committee', 'post-committee']} className="w-full">
            <AccordionItem value="pre-committee" className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-sm font-medium bg-muted/50 hover:no-underline rounded-t-lg">
                    Pre-committee Activity
                </AccordionTrigger>
                <AccordionContent className="border-t">
                    {data?.preCommittee.map(activity => <ActivityRow key={activity.id} activity={activity} />)}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="post-committee" className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-sm font-medium bg-muted/50 hover:no-underline">
                     Post-Committee Activity
                </AccordionTrigger>
                <AccordionContent className="border-t">
                     {data?.postCommittee.map(activity => <ActivityRow key={activity.id} activity={activity} />)}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
  );
}
