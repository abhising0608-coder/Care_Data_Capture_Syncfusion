'use client';

import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, CheckCircle2 } from 'lucide-react';
import type { CKCRequest, CKCRequestDocument } from '@/lib/definitions';

interface RequestDetailsModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="grid grid-cols-[150px_1fr] items-start p-3 border-b last:border-b-0 bg-blue-50/20 first:rounded-t-lg last:rounded-b-lg">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value || <span className="italic text-gray-400">Not Prefilled</span>}</span>
    </div>
);

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
             <Skeleton className="h-8 w-3/4 mb-4" />
            {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
         <div className="space-y-2">
             <Skeleton className="h-8 w-3/4 mb-4" />
            {Array.from({length: 7}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    </div>
)

export function RequestDetailsModal({ requestId, isOpen, onClose }: RequestDetailsModalProps) {
  
  const { data: request, isLoading } = useSWR<CKCRequest>(
    requestId ? `/api/ckc/requests/${requestId}` : null,
    fetcher
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            {isLoading || !request ? (
                <LoadingSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <Card className="bg-blue-50/10 border-blue-200">
                        <CardContent className="p-0">
                             <div className="p-3 bg-blue-100 rounded-t-lg">
                                <h3 className="font-semibold text-blue-800">{request.companyName}</h3>
                            </div>
                            <InfoRow label="Company ID" value={request.companyId} />
                            <InfoRow label="Rating Analyst" value={request.analystName} />
                            <InfoRow label="Group Head" value={request.groupHead} />
                            <InfoRow label="Name of HO / RO" value={request.hoRoName} />
                            <InfoRow label="Rating Cycle" value={request.cycle} />
                            <InfoRow label="Approach" value={request.resultType} />
                            <InfoRow label="Initiator Name" value={request.createdBy} />
                            <InfoRow label="Document Status" value={'Prefilled'} />
                            <InfoRow label="MCA Data" value={'No'} />
                            <InfoRow label="Comments" value="Nam semper, velit non interdum tristique, risus lectus lacinia ligula, id ultrices arcu nisl vitae elit. Duis a turpis nibh." />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document type</TableHead>
                                        <TableHead>Selected Years</TableHead>
                                        <TableHead>Documents</TableHead>
                                        <TableHead>Is Valid</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {request.documents.map((doc: CKCRequestDocument) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>{doc.docType}</TableCell>
                                            <TableCell>{doc.year}</TableCell>
                                            <TableCell>
                                                <Button variant="link" size="sm" className="p-0 h-auto">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    {doc.fileName}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                 <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    <span>{doc.valid}</span>
                                                 </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
