'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/firebase';
import { getCompaniesByRole } from '@/lib/mock-data';
import type { IPA, AppUser, RatingNote } from '@/lib/definitions';
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
import { IpaDiscussionTable } from '@/components/due-diligence/ipa-discussion-table';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function IpaFeedbackPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const { toast } = useToast();
  
  const [selectedRatingCycle, setSelectedRatingCycle] = useState<string | null>(params.ratingCycleId as string || null);
  const [ipas, setIpas] = useState<IPA[]>([]);
  
  const companies = getCompaniesByRole(user as AppUser);
  
  const { data: note, isLoading: isNoteLoading } = useSWR<RatingNote>(
    selectedRatingCycle ? `/api/notes/${selectedRatingCycle}` : null,
    fetcher
  );
  
  const { data: companyIpas, isLoading: isIpasLoading, mutate } = useSWR(
    selectedRatingCycle ? `/api/ipa/${selectedRatingCycle}` : null,
    fetcher
  );

  useEffect(() => {
    if (companyIpas) {
      setIpas(companyIpas);
    }
  }, [companyIpas]);


  const handleGo = () => {
    if (companyIpas) {
        setIpas(companyIpas);
    }
  };
  
  const handleAddDiscussion = (ipaId: string, newDiscussion: any) => {
      setIpas(prevIpas => 
        prevIpas.map(ipa => {
            if (ipa.id === ipaId) {
                return { ...ipa, discussions: [...ipa.discussions, newDiscussion] };
            }
            return ipa;
        })
      );
      mutate();
  }

  const IpaRow = ({ ipa }: { ipa: IPA }) => (
    <AccordionItem value={ipa.id}>
      <AccordionTrigger className="px-4">
        <span className="font-semibold">{ipa.firmName}</span>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="p-4 bg-muted/50 border-t">
          {note && (
             <IpaDiscussionTable 
                discussions={ipa.discussions}
                ipa={ipa}
                note={note}
                onAddDiscussion={(newDiscussion) => handleAddDiscussion(ipa.id, newDiscussion)}
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
          IPA Feedback
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
          <Button onClick={handleGo} disabled={!selectedRatingCycle || isIpasLoading || isNoteLoading}>
            {(isIpasLoading || isNoteLoading) ? 'Loading...' : 'Go'}
          </Button>
        </CardContent>
      </Card>

      {(isIpasLoading || isNoteLoading) && (
         <Card>
            <CardHeader><CardTitle>IPAs Firm</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {ipas.length > 0 && (
         <Card>
            <CardHeader><CardTitle>IPA Firm</CardTitle></CardHeader>
            <CardContent className="p-0">
                <Accordion type="multiple" collapsible className="w-full">
                    {ipas.map(ipa => <IpaRow key={ipa.id} ipa={ipa} />)}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
