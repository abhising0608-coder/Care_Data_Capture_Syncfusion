
'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
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
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  Settings,
  Download,
  Filter,
  Check,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '../ui/skeleton';
import type { CKCRequest, RequestStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OperationalRequestsTableProps {
  status: RequestStatus | 'PENDING' | 'ACCEPTED' | 'CLOSED';
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
}

export function OperationalRequestsTable({ status, globalFilter, setGlobalFilter }: OperationalRequestsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Reusing the CKC requests API for now, this can be pointed to a new API endpoint later.
  const { data: requests, isLoading } = useSWR<CKCRequest[]>(
      status ? `/api/ckc/requests?status=${status}` : null, 
      fetcher
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const handleAcceptRequest = (requestId: string) => {
    toast({
        title: 'Request Accepted',
        description: `Request ${requestId} has been successfully accepted.`
    });
    // Here you would add logic to mutate the SWR cache or refetch data
  };

  const columns: ColumnDef<CKCRequest>[] = React.useMemo(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Request ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <Link href={`/operational-input/${row.getValue('id')}`} className="text-blue-600 hover:underline">{row.getValue('id')}</Link>,
    },
     {
      accessorKey: 'companyName',
      header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Company Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <Link href={`/operational-input/${row.original.id}`} className="capitalize text-blue-600 hover:underline">{row.getValue('companyName')}</Link>,
    },
     {
      accessorKey: 'companyId',
      header: 'Company ID',
    },
    {
      accessorKey: 'listed',
      header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Listed
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
    },
     {
      accessorKey: 'cycle',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Cycle
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
        accessorKey: 'receivedDate',
        header: 'Received Date'
    },
    {
        accessorKey: 'auditedFY',
        header: 'Audited FY'
    },
    {
        accessorKey: 'analystName',
        header: 'CKC Analyst Name'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (status === 'PENDING') {
            return (
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleAcceptRequest(row.original.id)}>
                    <Check className="h-4 w-4 text-green-600" />
                </Button>
            );
        }
        if (status === 'ACCEPTED') {
            return (
                <Button variant="outline" size="sm" onClick={() => router.push(`/operational-input/${row.original.id}`)}>
                    Initiate
                </Button>
            )
        }
        return null;
      },
    },
  ], [status, toast, router]);

  React.useEffect(() => {
    setColumnVisibility({
        'analystName': status === 'ACCEPTED',
        'actions': status !== 'CLOSED',
    });
  }, [status]);


  const table = useReactTable({
    data: requests || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startingRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endingRow = totalRows > 0 ? Math.min((pageIndex + 1) * pageSize, totalRows) : 0;

  return (
    <div className="w-full">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={columns.length}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No requests found for this status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startingRow} - {endingRow} of {totalRows} entries
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm">Show</span>
             <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                }}
                >
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <span className="text-sm">results</span>
        </div>
        <div className="flex items-center space-x-2">
             <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Previous
            </Button>
             {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).slice(0, 3).map(page => (
                <Button key={page} variant={table.getState().pagination.pageIndex + 1 === page ? 'default' : 'outline'} size="sm" onClick={() => table.setPageIndex(page - 1)}>{page}</Button>
            ))}
            {table.getPageCount() > 3 && <span>...</span>}
            {table.getPageCount() > 3 && <Button variant='outline' size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)}>{table.getPageCount()}</Button>}
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            Next
            </Button>
        </div>
      </div>
    </div>
  );
}
