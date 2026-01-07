
'use client';

import type { RatingNote, RatingInstrument } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import useSWR from 'swr';
import { Skeleton } from '../ui/skeleton';

interface PressReleaseInitiationProps {
    note: RatingNote;
    onPrepare: () => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InfoField = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'N/A'}</p>
    </div>
);

export function PressReleaseInitiation({ note, onPrepare }: PressReleaseInitiationProps) {
    const { data: instruments, isLoading } = useSWR<RatingInstrument[]>(
        note.companyId ? `/api/instruments/${note.companyId}` : null, 
        fetcher
    );

    const totalInstrumentSize = instruments?.reduce((acc, inst) => acc + inst.instrumentSize, 0) || 0;

    return (
         <div className="space-y-6">
            <header className="flex h-auto items-center justify-between gap-4 flex-wrap">
                <div className="flex-1">
                     <h1 className="text-2xl font-semibold text-foreground">
                        Initiate Press Release: {note.companyName}
                    </h1>
                    <p className="text-muted-foreground">
                        Review the final ratings and instruments before preparing the Press Release.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={onPrepare}>
                        <Newspaper className="mr-2 h-4 w-4" /> Prepare Press Release
                    </Button>
                </div>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Committee & Rating Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoField label="Mandate ID" value={note.ratingNoteData?.workflowContext.mandateId} />
                    <InfoField label="Rating Cycle" value={note.ratingCycle} />
                    <InfoField 
                        label="Date of Committee" 
                        value={note.ratingNoteData?.workflowContext.committeeDate ? format(new Date(note.ratingNoteData.workflowContext.committeeDate), 'dd-MMM-yyyy') : 'N/A'}
                    />
                    <InfoField label="PCL Acceptance Date" value="N/A" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Instrument Details</CardTitle>
                    <CardDescription>
                        The following instruments were presented in the committee.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Instrument ID</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Instrument Name</TableHead>
                                    <TableHead className="text-right">Instrument Amount (Lacs)</TableHead>
                                    <TableHead>Rating Assigned</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    instruments?.map((instrument) => (
                                        <TableRow key={instrument.id}>
                                            <TableCell>{instrument.instrumentId}</TableCell>
                                            <TableCell>{instrument.category}</TableCell>
                                            <TableCell>{instrument.instrument}</TableCell>
                                            <TableCell className="text-right">{instrument.instrumentSize.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>{instrument.cycleHistory[0]?.rating || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                 <TableRow className="font-bold bg-muted/50">
                                    <TableCell colSpan={3}>Total Instrument Amount Size</TableCell>
                                    <TableCell className="text-right">{totalInstrumentSize.toLocaleString('en-IN')}</TableCell>
                                    <TableCell></TableCell>
                                 </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
