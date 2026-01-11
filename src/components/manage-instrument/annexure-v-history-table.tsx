
'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  Search,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import type { AnnexureVHistory } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), 'dd-MM-yyyy');
    } catch {
        return 'Invalid Date';
    }
}

export function AnnexureVHistoryTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const { toast } = useToast();
    const params = useParams();
    const companyId = params.ratingCycleId as string;

    const { data, error, isLoading } = useSWR<AnnexureVHistory[]>(
        companyId ? `/api/instruments/${companyId}/annexure-v` : null,
        fetcher
    );

    const maxRatingActions = React.useMemo(() => {
        if (!data) return 0;
        return Math.max(...data.map(item => item.ratingActions.length), 0);
    }, [data]);
    
    const columns = React.useMemo<ColumnDef<AnnexureVHistory>[]>(() => {
        const baseColumns: ColumnDef<AnnexureVHistory>[] = [
            { accessorKey: 'id', header: 'Runn. INST ID' },
            { accessorKey: 'instrument', header: 'Instrument' },
            { 
                accessorKey: 'status', 
                header: 'Inst. Status',
                cell: ({ row }) => {
                    const status = row.getValue('status') as string;
                    const variant = status === 'Active' ? 'default' : (status === 'Withdrawn' ? 'destructive' : 'secondary');
                    return <Badge variant={variant}>{status}</Badge>
                }
            },
            { 
                accessorKey: 'amount', 
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Amount (In Cr)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div className="text-right">{(row.getValue('amount') as number).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            },
            { accessorKey: 'count', header: 'Cnt' },
            { 
                accessorKey: 'initialRatingDate', 
                header: 'Initial Rating Date',
                cell: ({ row }) => formatDate(row.getValue('initialRatingDate'))
            },
            { accessorKey: 'initialRating', header: 'Initial Rating' },
        ];

        for (let i = 0; i < maxRatingActions; i++) {
            baseColumns.push(
                {
                    id: `ratingActionDate-${i}`,
                    header: `${i + 1} Date`,
                    cell: ({ row }) => {
                        const action = row.original.ratingActions[i];
                        return action ? formatDate(action.date) : null;
                    },
                },
                {
                    id: `ratingActionRating-${i}`,
                    header: `${i + 1} Rating`,
                    accessorFn: row => row.ratingActions[i]?.rating,
                }
            );
        }

        return baseColumns;

    }, [maxRatingActions]);

    const table = useReactTable({
        data: data || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });
    
    const handleExport = () => {
      toast({
        title: "Export Placeholder",
        description: "This is where the CSV/Excel export functionality would be triggered."
      })
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <div className="relative flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search instruments..."
                        value={(table.getColumn('instrument')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('instrument')?.setFilterValue(event.target.value)
                        }
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                    />
                </div>
                 <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
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
                        {isLoading ? (
                             Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                <TableCell colSpan={columns.length}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No Annexure V history found.
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
        </div>
    );
}
