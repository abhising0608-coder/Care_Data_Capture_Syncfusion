'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Eye, Edit, Download, FileText, ChevronDown, Loader2 } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import type { PressReleaseHistoryEntry, PressReleaseHistoryMandate, PressReleaseHistoryInstrument } from '@/lib/definitions';


const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PressReleaseHistory() {
  const params = useParams();
  const noteId = params.ratingCycleId as string;
  const { toast } = useToast();

  const { data: history, isLoading } = useSWR<PressReleaseHistoryEntry[]>(
    noteId ? `/api/notes/pr-history/${noteId}` : null,
    fetcher
  );

  const handleAction = (action: string, id: string) => {
    toast({
      title: 'Action Triggered',
      description: `${action} on item ${id} is a placeholder.`,
    });
  };
  
  const MandateAccordion = ({ mandate }: { mandate: PressReleaseHistoryMandate }) => (
    <Accordion type="single" collapsible className="w-full bg-background">
      <AccordionItem value={mandate.mandateId}>
        <AccordionTrigger className="px-4 py-2 text-sm font-medium bg-muted/60 rounded-md">
          {mandate.mandateId}
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ins. ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub Category</TableHead>
                <TableHead>Instrument Name</TableHead>
                <TableHead className="text-right">Instrument Size</TableHead>
                <TableHead>Agenda Type</TableHead>
                <TableHead>Rating Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mandate.instruments.map((inst) => (
                <TableRow key={inst.insId}>
                  <TableCell>{inst.insId}</TableCell>
                  <TableCell>{inst.category}</TableCell>
                  <TableCell>{inst.subCategory}</TableCell>
                  <TableCell>{inst.instrumentName}</TableCell>
                  <TableCell className="text-right">{inst.instrumentSize}</TableCell>
                  <TableCell>{inst.agendaType}</TableCell>
                  <TableCell>{inst.ratingAssigned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  if (isLoading) {
    return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
  }

  if (!history || history.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md mt-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">No Press Release History Found</p>
            <p className="text-muted-foreground">There are no historical press releases for this company yet.</p>
        </div>
    )
  }

  return (
    <div className="pt-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
        {history.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
                <div className="flex items-center justify-between w-full">
                <span>Press Release - {format(new Date(item.pressReleaseDate), 'dd/MM/yyyy')}</span>
                <div className="flex items-center gap-2 pr-4">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAction('View', item.id)}}>
                        <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleAction('Request Edit Access', item.id)}}>
                        Request Edit Access
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                     <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleAction('Download PDF', item.id)}}>
                        <Download className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 bg-muted/50 border-t">
                {item.mandates.length > 0 ? (
                    <div className="space-y-2">
                        {item.mandates.map(mandate => <MandateAccordion key={mandate.mandateId} mandate={mandate} />)}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No mandate details available for this press release.</p>
                )}
            </AccordionContent>
            </AccordionItem>
        ))}
        </Accordion>
    </div>
  );
}
