
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import type { CompanyDashboard } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ManageInstrumentLandingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const { data: companies, isLoading: areCompaniesLoading } = useSWR<CompanyDashboard[]>(
    user ? `/api/companies?role=${user.role}` : null,
    fetcher
  );

  const handleSubmit = () => {
    if (selectedCompanyId) {
      router.push(`/manage-instrument/${selectedCompanyId}`);
    }
  };
  
  const isLoading = isAuthLoading || areCompaniesLoading;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Instrument
        </h1>
        <p className="text-muted-foreground">
          Select a company to manage its instrument details.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
            <div className="flex items-end gap-4">
                 <div className="w-full max-w-sm space-y-2">
                     <Label htmlFor="company-select">Company Name</Label>
                    <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                        <SelectTrigger id="company-select">
                        <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                        {isLoading ? (
                            <div className="p-2"><Skeleton className="h-8 w-full" /></div>
                        ) : (
                            companies?.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.companyName}
                                </SelectItem>
                            ))
                        )}
                        </SelectContent>
                    </Select>
                 </div>
                <Button onClick={handleSubmit} disabled={!selectedCompanyId}>
                    Submit
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
