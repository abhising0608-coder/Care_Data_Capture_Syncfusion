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
import { format, parse } from 'date-fns';
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
import type { DMSDocumentHistory } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDate = (dateString: string) => {
    if (!dateString || dateString === '-') return '-';
    try {
        // Attempt to parse multiple possible formats
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const parsed = parse(dateString, 'yyyy-MM-dd HH:mm a', new Date());
             if (isNaN(parsed.getTime())) return 'Invalid Date';
             return format(parsed, 'dd-MM-yyyy hh:mm a');
        }
        return format(date, 'dd-MM-yyyy hh:mm a');
    } catch {
        return 'Invalid Date';
    }
}


export function DMSDocumentHistoryTable() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const { toast } = useToast();
    const params = useParams();
    const companyId = params.ratingCycleId as string;

    const { data, error, isLoading } = useSWR<DMSDocumentHistory[]>(
        companyId ? `/api/instruments/${companyId}/dms-document-history` : null,
        fetcher
    );
    
    const columns = React.useMemo<ColumnDef<DMSDocumentHistory>[]>(() => [
        { accessorKey: 'documentName', header: 'Document' },
        { 
            accessorKey: 'dmsStatus', 
            header: 'DMS Status',
            cell: ({ row }) => {
                const status = row.getValue('dmsStatus') as string;
                const variant = status === 'Uploaded' ? 'default' : (status === 'Reviewed' ? 'secondary' : 'outline');
                return <Badge variant={variant}>{status}</Badge>
            }
        },
        { accessorKey: 'dmsProcessType', header: 'DMS Process Type' },
        { 
            accessorKey: 'dmsUploadedOn', 
            header: 'DMS Uploaded On',
            cell: ({ row }) => formatDate(row.getValue('dmsUploadedOn'))
        },
        { accessorKey: 'dmsUploadedBy', header: 'DMS Uploaded by' },
        { accessorKey: 'reason', header: 'Reason' },
        { accessorKey: 'mandateId', header: 'Mandate ID' },
    ], []);

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
                        placeholder="Search documents..."
                        value={(table.getColumn('documentName')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('documentName')?.setFilterValue(event.target.value)
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
                             Array.from({ length: 8 }).map((_, i) => (
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
                                    No DMS document history found.
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
