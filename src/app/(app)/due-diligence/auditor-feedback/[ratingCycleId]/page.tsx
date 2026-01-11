'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/firebase';
import { getCompaniesByRole, getAuditorsByCompanyId } from '@/lib/mock-data';
import type { Auditor, AppUser, CompanyDashboard } from '@/lib/definitions';

import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const statusVariant = (status: string) => {
    switch (status) {
        case 'Feedback Captured': return 'default';
        case 'Minutes Uploaded': return 'secondary';
        case 'Pending':
        default: return 'outline';
    }
}

export default function AuditorFeedbackPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(params.ratingCycleId as string || null);
  const [auditors, setAuditors] = useState<Auditor[]>([]);

  const companies = getCompaniesByRole(user as AppUser);
  const { data: companyAuditors, isLoading: isAuditorsLoading } = useSWR(selectedCompany ? `/api/auditors/${selectedCompany}` : null, fetcher);

  const handleGo = () => {
    if (companyAuditors) {
        setAuditors(companyAuditors);
    }
  };

  const AuditorRow = ({ auditor }: { auditor: Auditor }) => (
    <AccordionItem value={auditor.id}>
      <AccordionTrigger className="px-4">
        <div className="flex items-center justify-between w-full">
            <span className="font-semibold">{auditor.firmName}</span>
            <div className="flex items-center gap-4 pr-4">
                <Badge variant={statusVariant(auditor.status) as any}>{auditor.status}</Badge>
                <Button size="sm" variant="outline">Upload Minutes</Button>
            </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 bg-muted/50 border-t">
          <p className="font-semibold mb-2">Previous Discussion History:</p>
          <ul className="space-y-2 text-sm">
            {auditor.history.map(h => (
              <li key={h.date} className="flex justify-between items-center p-2 border rounded-md bg-background">
                <span>Feedback captured on <span className="font-medium">{h.date}</span> by <span className="font-medium">{h.capturedBy}</span></span>
                <Button variant="link" size="sm">View</Button>
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Auditor Feedback
        </h1>
        <Button variant="outline">Documents</Button>
      </header>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <label htmlFor="company-select" className="text-sm font-medium">Company Name</label>
          <div className="flex-1 max-w-md">
            <Select onValueChange={setSelectedCompany} value={selectedCompany || ''}>
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
          <Button onClick={handleGo} disabled={!selectedCompany || isAuditorsLoading}>
            {isAuditorsLoading ? 'Loading...' : 'Go'}
          </Button>
        </CardContent>
      </Card>

      {isAuditorsLoading && (
         <Card>
            <CardHeader><CardTitle>Auditors Firm</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {auditors.length > 0 && (
         <Card>
            <CardHeader><CardTitle>Auditors Firm</CardTitle></CardHeader>
            <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                    {auditors.map(auditor => <AuditorRow key={auditor.id} auditor={auditor} />)}
                </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
