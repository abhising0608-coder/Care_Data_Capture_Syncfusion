
'use client';

import type { RatingNote, RatingInstrument } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import useSWR from 'swr';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface PressReleaseInitiationProps {
    note: RatingNote;
    onPrepare: () => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InfoField = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="flex justify-between items-center py-2 px-4 border-b">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'N/A'}</p>
    </div>
);

export function PressReleaseInitiation({ note, onPrepare }: PressReleaseInitiationProps) {
    const { data: instruments, isLoading } = useSWR<RatingInstrument[]>(
        note.companyId ? `/api/instruments/${note.companyId}` : null, 
        fetcher
    );

    const instrumentsByMandate = instruments?.reduce((acc, inst) => {
        const key = inst.mandateId || 'Unknown Mandate';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(inst);
        return acc;
    }, {} as Record<string, RatingInstrument[]>);

    const mandateIds = instrumentsByMandate ? Object.keys(instrumentsByMandate) : [];
    
    return (
         <div className="space-y-6 mt-4">
            <Card>
                <CardContent className="p-0">
                    <InfoField 
                        label="Date of Committee" 
                        value={note.ratingNoteData?.workflowContext.committeeDate ? format(new Date(note.ratingNoteData.workflowContext.committeeDate), 'dd-MMM-yyyy') : 'N/A'}
                    />
                     <InfoField 
                        label="Status" 
                        value={note.status}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mandate Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <Skeleton className="h-48 w-full" />
                    ) : (
                        <Accordion type="multiple" defaultValue={mandateIds} className="w-full">
                           {instrumentsByMandate && Object.entries(instrumentsByMandate).map(([mandateId, mandateInstruments]) => (
                                <AccordionItem value={mandateId} key={mandateId}>
                                    <AccordionTrigger className="font-semibold">{mandateId}</AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Instrument ID</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Sub Category</TableHead>
                                                    <TableHead>Instrument Name</TableHead>
                                                    <TableHead className="text-right">Total INS Amt. Size</TableHead>
                                                    <TableHead>PCL Acceptance Date</TableHead>
                                                    <TableHead>Rating Assigned</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                 {mandateInstruments.map((instrument) => (
                                                    <TableRow key={instrument.id}>
                                                        <TableCell>{instrument.instrumentId}</TableCell>
                                                        <TableCell>{instrument.category}</TableCell>
                                                        <TableCell>{instrument.subCategory}</TableCell>
                                                        <TableCell>{instrument.instrument}</TableCell>
                                                        <TableCell className="text-right">{instrument.instrumentSize.toLocaleString('en-IN')}</TableCell>
                                                        <TableCell>Prefill</TableCell>
                                                        <TableCell>{instrument.cycleHistory[0]?.rating || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                           ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>

             <div className="flex justify-end">
                <Button onClick={onPrepare}>
                    <Newspaper className="mr-2 h-4 w-4" /> Prepare Press Release
                </Button>
            </div>

        </div>
    )
}
