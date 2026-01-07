
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { RatingInstrumentCycle } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { useRouter, useParams } from 'next/navigation';

interface InstrumentCycleHistoryTableProps {
    cycleHistory: RatingInstrumentCycle[];
}


export function InstrumentCycleHistoryTable({ cycleHistory }: InstrumentCycleHistoryTableProps) {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const companyId = params.ratingCycleId as string;


    const handleEditIsin = (instrumentId: string, rcmId: string) => {
        router.push(`/manage-instrument/isin-update/${companyId}/${instrumentId}/${rcmId}`);
    };

    const handleAddBanker = (rcmId: string) => {
         toast({ title: 'Placeholder', description: `Add Banker/Lender action for RCM ID: ${rcmId}` });
    };

    const columns: ColumnDef<RatingInstrumentCycle>[] = [
        { accessorKey: 'rcmId', header: 'RCM ID' },
        { accessorKey: 'instrumentDetailId', header: 'Ins. Det ID' },
        { 
            accessorKey: 'cycleStatus', 
            header: 'Cycle Status',
            cell: ({ row }) => <Badge variant={row.original.cycleStatus === 'C' ? 'default' : 'secondary'}>{row.original.cycleStatus}</Badge>
        },
        { 
            accessorKey: 'cycleStartDate', 
            header: 'Cycle Start Date',
            cell: ({ row }) => new Date(row.original.cycleStartDate).toLocaleDateString()
        },
        { accessorKey: 'meetingType', header: 'Meeting Type' },
        { 
            accessorKey: 'meetingDate', 
            header: 'Meeting Date',
            cell: ({ row }) => new Date(row.original.meetingDate).toLocaleDateString()
        },
        { accessorKey: 'rating', header: 'Rating' },
        { accessorKey: 'ratingAction', header: 'Rating Action' },
        { 
            accessorKey: 'instrumentSize', 
            header: 'Ins. Size(Lacs)',
            cell: ({ row }) => row.original.instrumentSize.toLocaleString()
        },
        { 
            accessorKey: 'outstandingAmount', 
            header: 'Outst. Amt(Lacs)',
            cell: ({ row }) => row.original.outstandingAmount.toLocaleString()
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const cycle = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditIsin(cycle.instrumentId, cycle.rcmId)}>
                                <Pencil className="mr-2 h-4 w-4" />Edit ISIN
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddBanker(cycle.rcmId)}>
                                Add Banker/Lender
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: cycleHistory || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-4 bg-muted/50 w-full">
             <div className="rounded-md border bg-card">
                 <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No cycle history found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
