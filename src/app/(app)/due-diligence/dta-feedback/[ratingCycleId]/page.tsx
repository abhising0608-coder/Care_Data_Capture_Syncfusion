'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/firebase';
import { getCompaniesByRole } from '@/lib/mock-data';
import type { DTA, AppUser, RatingNote } from '@/lib/definitions';
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
import { DtaDiscussionTable } from '@/components/due-diligence/dta-discussion-table';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DtaFeedbackPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const { toast } = useToast();
  
  const [selectedRatingCycle, setSelectedRatingCycle] = useState<string | null>(params.ratingCycleId as string || null);
  const [dtas, setDtas] = useState<DTA[]>([]);
  
  const companies = getCompaniesByRole(user as AppUser);
  
  const { data: note, isLoading: isNoteLoading } = useSWR<RatingNote>(
    selectedRatingCycle ? `/api/notes/${selectedRatingCycle}` : null,
    fetcher
  );
  
  const { data: companyDtas, isLoading: isDtasLoading, mutate } = useSWR(
    selectedRatingCycle ? `/api/dta/${selectedRatingCycle}` : null,
    fetcher
  );

  useEffect(() => {
    if (companyDtas) {
      setDtas(companyDtas);
    }
  }, [companyDtas]);


  const handleGo = () => {
    if (companyDtas) {
        setDtas(companyDtas);
    }
  };
  
  const handleAddDiscussion = (dtaId: string, newDiscussion: any) => {
      setDtas(prevDtas => 
        prevDtas.map(dta => {
            if (dta.id === dtaId) {
                return { ...dta, discussions: [...dta.discussions, newDiscussion] };
            }
            return dta;
        })
      );
      mutate();
  }

  const DtaRow = ({ dta }: { dta: DTA }) => (
    <AccordionItem value={dta.id}>
      <AccordionTrigger className="px-4">
        <span className="font-semibold">{dta.firmName}</span>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="p-4 bg-muted/50 border-t">
          {note && (
             <DtaDiscussionTable 
                discussions={dta.discussions}
                dta={dta}
                note={note}
                onAddDiscussion={(newDiscussion) => handleAddDiscussion(dta.id, newDiscussion)}
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
          DTA Feedback
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
          <Button onClick={handleGo} disabled={!selectedRatingCycle || isDtasLoading || isNoteLoading}>
            {(isDtasLoading || isNoteLoading) ? 'Loading...' : 'Go'}
          </Button>
        </CardContent>
      </Card>

      {(isDtasLoading || isNoteLoading) && (
         <Card>
            <CardHeader><CardTitle>DTs Firm</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {dtas.length > 0 && (
         <Card>
            <CardHeader><CardTitle>DTs Firm</CardTitle></CardHeader>
            <CardContent className="p-0">
                <Accordion type="multiple" collapsible className="w-full">
                    {dtas.map(dta => <DtaRow key={dta.id} dta={dta} />)}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
