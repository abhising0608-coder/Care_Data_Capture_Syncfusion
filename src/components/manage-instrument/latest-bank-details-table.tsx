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
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import type { LatestBankDetail } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LatestBankDetailsTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const { toast } = useToast();
    const params = useParams();
    const companyId = params.ratingCycleId as string;

    const { data, error, isLoading } = useSWR<LatestBankDetail[]>(
        companyId ? `/api/instruments/${companyId}/latest-bank-details` : null,
        fetcher
    );

    const columns: ColumnDef<LatestBankDetail>[] = [
        { accessorKey: 'id', header: 'Runn. INST ID' },
        { accessorKey: 'bankLender', header: 'Bank / Lender' },
        { accessorKey: 'instrument', header: 'Instrument' },
        { 
            accessorKey: 'ratedAmount', 
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Rated Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-right">{row.original.ratedAmount.toLocaleString()}</div>
        },
        { accessorKey: 'foreignCurrAmount', header: 'Foreign Curr. Amt.' },
        { accessorKey: 'currency', header: 'Currency' },
        { accessorKey: 'debtRepaymentTerms', header: 'Debt Repayment Terms' },
        { accessorKey: 'remark', header: 'Remark' },
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
                        placeholder="Search bank details..."
                        value={(table.getColumn('bankLender')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('bankLender')?.setFilterValue(event.target.value)
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
                                    No bank details found for this company.
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
