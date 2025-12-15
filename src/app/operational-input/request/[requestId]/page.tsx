'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { CKCRequest } from '@/lib/definitions';

interface DocumentInfo {
  docType: 'Audited' | 'Provisional' | 'Projection';
  years: string[];
  isValid: boolean;
}

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const requestRef = useMemoFirebase(() => {
    if (!firestore || !requestId) return null;
    return doc(firestore, 'ckc_operational_requests', requestId);
  }, [firestore, requestId]);

  const { data: request, isLoading } = useDoc<CKCRequest>(requestRef);

  const documents: DocumentInfo[] = useMemo(() => {
    if (!request) return [];
    const docs: DocumentInfo[] = [];
    if (request.auditedFY && request.auditedFY.length > 0) {
      docs.push({ docType: 'Audited', years: request.auditedFY, isValid: true });
    }
    if (request.provisionalFY && request.provisionalFY.length > 0) {
      docs.push({ docType: 'Provisional', years: request.provisionalFY, isValid: true });
    }
    if (request.projectionFY && request.projectionFY.length > 0) {
      docs.push({ docType: 'Projection', years: request.projectionFY, isValid: false });
    }
    return docs;
  }, [request]);

  const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading || isUserLoading ? (
        <Skeleton className="h-6 w-3/4 mt-1" />
      ) : (
        <p className="text-base font-medium">{value || 'N/A'}</p>
      )}
    </div>
  );

  const statusVariant = (status: string | undefined) => {
    switch (status) {
      case 'ACCEPTED':
        return 'secondary';
      case 'CLOSED':
        return 'destructive';
      case 'PENDING':
      default:
        return 'default';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/ckc-requests">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Request Details</h1>
          <p className="text-muted-foreground">Read-only view of request ID: {requestId}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Request Metadata</CardTitle>
              <CardDescription>
                Core information about the operational data request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <InfoField label="Company Name" value={request?.companyName} />
                <InfoField label="Company ID" value={request?.companyId} />
                <InfoField label="Rating Analyst Name" value={request?.dealingAnalyst} />
                <InfoField label="Group Head" value={request?.groupHead} />
                <InfoField label="Name of HO / RO" value={request?.hoRoName} />
                <InfoField label="Rating Cycle" value={request?.cycle} />
                <InfoField label="Result Type" value={request?.resultType} />
                <InfoField label="Initiator Name" value={request?.createdBy} />
                <InfoField
                  label="Document Status"
                  value={request && <Badge variant={statusVariant(request.status)}>{request.status}</Badge>}
                />
                <InfoField label="MCA Data" value="Yes" />
                <InfoField label="Comments" value={request?.remarks} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                Associated documents for this request.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Selected Years</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Is Valid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isUserLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : documents.length > 0 ? (
                            documents.map((doc, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{doc.docType}</TableCell>
                                    <TableCell>{doc.years.join(', ')}</TableCell>
                                    <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => alert('Download functionality to be implemented.')}>
                                        <Download className="h-5 w-5 text-accent" />
                                    </Button>
                                    </TableCell>
                                    <TableCell>
                                    {doc.isValid ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                            No documents found for this request.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
