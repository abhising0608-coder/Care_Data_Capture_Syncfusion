
'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CKCRequest } from '@/lib/definitions';
import { ArrowRight } from 'lucide-react';
import { useWorkflow } from '@/context/workflow-context';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RatingNoteListPage() {
  const { data: approvedRequests, isLoading } = useSWR<CKCRequest[]>('/api/requests?status=APPROVED', fetcher);
  const { startWorkflow } = useWorkflow();
  const router = useRouter();


  const handleGenerate = (req: CKCRequest) => {
    // In a real app, we might create the note first, then navigate.
    // For now, we assume the note is findable by the same ID for simplicity.
    startWorkflow(req.id);
    router.push(`/company-information/${req.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Rating Note Generation</h1>
        <p className="text-muted-foreground">
          Select an approved request to generate or view the Rating Committee Note.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Approved Operational Data Requests</CardTitle>
          <CardDescription>
            These requests have been approved by the CKC Checker and are ready for rating note generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : approvedRequests && approvedRequests.length > 0 ? (
                  approvedRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.id}</TableCell>
                      <TableCell>{req.companyName}</TableCell>
                      <TableCell>{req.cycle}</TableCell>
                      <TableCell><Badge variant="secondary">{req.status}</Badge></TableCell>
                      <TableCell>
                        <Button onClick={() => handleGenerate(req)} variant="outline" size="sm">
                            Initiate Workflow <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No approved requests available for note generation.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
