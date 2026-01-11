'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/firebase';
import { getCompaniesByRole } from '@/lib/mock-data';
import type { Banker, AppUser, RatingNote } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BankerDiscussionTable } from '@/components/due-diligence/banker-discussion-table';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BankerFeedbackPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const { toast } = useToast();
  
  const [selectedRatingCycle, setSelectedRatingCycle] = useState<string | null>(params.ratingCycleId as string || null);
  const [bankers, setBankers] = useState<Banker[]>([]);
  
  const companies = getCompaniesByRole(user as AppUser);
  
  const { data: note, isLoading: isNoteLoading } = useSWR<RatingNote>(
    selectedRatingCycle ? `/api/notes/${selectedRatingCycle}` : null,
    fetcher
  );
  
  const { data: companyBankers, isLoading: isBankersLoading, mutate } = useSWR(
    selectedRatingCycle ? `/api/bankers/${selectedRatingCycle}` : null,
    fetcher
  );

  useEffect(() => {
    if (companyBankers) {
      setBankers(companyBankers);
    }
  }, [companyBankers]);


  const handleGo = () => {
    if (companyBankers) {
        setBankers(companyBankers);
    }
  };
  
  const handleAddDiscussion = (bankerId: string, newDiscussion: any) => {
      setBankers(prevBankers => 
        prevBankers.map(banker => {
            if (banker.id === bankerId) {
                return { ...banker, discussions: [...banker.discussions, newDiscussion] };
            }
            return banker;
        })
      );
      mutate();
  }

  const BankerRow = ({ banker }: { banker: Banker }) => (
    <AccordionItem value={banker.id}>
      <AccordionTrigger className="px-4">
        <span className="font-semibold">{banker.bankName}</span>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="p-4 bg-muted/50 border-t">
          {note && (
             <BankerDiscussionTable 
                discussions={banker.discussions}
                banker={banker}
                note={note}
                onAddDiscussion={(newDiscussion) => handleAddDiscussion(banker.id, newDiscussion)}
             />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Banker Feedback
        </h1>
        <Button variant="outline">Documents</Button>
      </header>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <label htmlFor="company-select" className="text-sm font-medium">Company Name</label>
          <div className="flex-1 max-w-md">
            <Select onValueChange={setSelectedRatingCycle} value={selectedRatingCycle || ''}>
              <SelectTrigger id="company-select">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {isAuthLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.companyName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGo} disabled={!selectedRatingCycle || isBankersLoading || isNoteLoading}>
            {(isBankersLoading || isNoteLoading) ? 'Loading...' : 'Go'}
          </Button>
        </CardContent>
      </Card>

      {(isBankersLoading || isNoteLoading) && (
         <Card>
            <CardHeader><CardTitle>Bankers List</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {bankers.length > 0 && (
         <Card>
            <CardHeader><CardTitle>Bankers List</CardTitle></CardHeader>
            <CardContent className="p-0">
                <Accordion type="multiple" collapsible className="w-full">
                    {bankers.map(banker => <BankerRow key={banker.id} banker={banker} />)}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
