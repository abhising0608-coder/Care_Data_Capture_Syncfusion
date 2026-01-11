
'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
  Row,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  Pencil,
  Trash2,
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import type { RatingInstrument } from '@/lib/definitions';
import { InstrumentCycleHistoryTable } from './instrument-cycle-history-table';
import { InstrumentEditModal } from './instrument-edit-modal';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const renderDetailPanel = ({ row }: { row: Row<RatingInstrument> }) => {
    return <InstrumentCycleHistoryTable cycleHistory={row.original.cycleHistory} />
}

export function InstrumentDetailsTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const companyId = params.ratingCycleId as string;

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [editingInstrument, setEditingInstrument] = React.useState<RatingInstrument | null>(null);

    const { data, error, isLoading, mutate } = useSWR<RatingInstrument[]>(
        companyId ? `/api/instruments/${companyId}` : null,
        fetcher
    );

    const handleEdit = (instrument: RatingInstrument) => {
        setEditingInstrument(instrument);
        setIsEditModalOpen(true);
    };

    const handleDelete = (instrumentId: string) => {
         toast({ title: 'Placeholder', description: `Delete action for Instrument ID: ${instrumentId}` });
    };

    const handleSave = (updatedInstrument: RatingInstrument) => {
        // Here you would call an API to save the data
        // For now, we just show a toast and update the local state via SWR
        const updatedData = data?.map(inst => inst.id === updatedInstrument.id ? updatedInstrument : inst);
        mutate(updatedData, false); // Optimistic update
        toast({ title: 'Success', description: 'Instrument details have been updated.'});
        setIsEditModalOpen(false);
    };

    const columns: ColumnDef<RatingInstrument>[] = [
        {
            accessorKey: 'expand',
            header: () => null,
            cell: ({ row }) => {
                return (
                     <Button
                        variant="ghost"
                        size="icon"
                        {...{
                        onClick: () => row.toggleExpanded(),
                        }}
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? 'rotate-180' : ''}`} />
                    </Button>
                )
            },
        },
        {
            accessorKey: 'id',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Running Ins. ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue('id')}</div>,
        },
        {
            accessorKey: 'instrumentStatus',
            header: 'Ins. Status',
            cell: ({ row }) => <Badge variant={row.getValue('instrumentStatus') === 'Active' ? 'default' : 'destructive'}>{row.getValue('instrumentStatus')}</Badge>,
        },
        { accessorKey: 'groupHead', header: 'Group Head' },
        { accessorKey: 'ratingAnalyst', header: 'Rating Analyst' },
        { accessorKey: 'client', header: 'Client' },
        { accessorKey: 'mandateId', header: 'Mandate ID' },
        { 
            accessorKey: 'mandateDate', 
            header: 'Mandate Date',
            cell: ({ row }) => new Date(row.getValue('mandateDate')).toLocaleDateString()
        },
        { accessorKey: 'mandateStatus', header: 'Mandate Status' },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const instrument = row.original;
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
                            <DropdownMenuItem onClick={() => handleEdit(instrument)}><Pencil className="mr-2 h-4 w-4" />Edit Instrument</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(instrument.id)}>
                               <Trash2 className="mr-2 h-4 w-4" /> Delete Instrument
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getExpandedRowModel: getExpandedRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Instrument Details</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toast({ title: "Placeholder", description: "Add new instrument form to be implemented."})}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Instrument
                            </Button>
                             <Button variant="outline" size="sm" onClick={() => router.push('/manage-instrument/update-inc-status')}>
                               Update INC Status
                            </Button>
                        </div>
                    </div>
                    <CardDescription>
                        A list of all instruments associated with this company. Click the arrow to see more details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
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
                                        <React.Fragment key={row.id}>
                                            <TableRow data-state={row.getIsSelected() && 'selected'}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                                ))}
                                            </TableRow>
                                            {row.getIsExpanded() && (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length}>{renderDetailPanel({ row })}</TableCell>
                                                </TableRow>
                                            )}
                                         </React.Fragment>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            {isLoading ? "Loading instruments..." : "No instruments found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex items-center justify-end space-x-2 py-4">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {editingInstrument && (
                <InstrumentEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    instrument={editingInstrument}
                    onSave={handleSave}
                    allInstruments={data || []}
                />
            )}
        </>
    );
}
