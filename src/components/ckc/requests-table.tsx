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
  Filter
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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


const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CKCRequestsTableProps {
  status: RequestStatus | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED' | 'WITHDRAWN' | 'ON_HOLD';
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
}


export function CKCRequestsTable({ status, globalFilter, setGlobalFilter }: CKCRequestsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: requests, isLoading } = useSWR<CKCRequest[]>(
      status ? `/api/ckc/requests?status=${status}` : null, 
      fetcher
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      'companyId': false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  

  const columns: ColumnDef<CKCRequest>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Request ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Filter className="ml-2 h-4 w-4" />
          </div>
      ),
      cell: ({ row }) => <Link href={`/ckc/requests/${row.getValue('id')}`} className="text-blue-600 hover:underline">{row.getValue('id')}</Link>,
    },
     {
      accessorKey: 'companyName',
      header: ({ column }) => (
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Company Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
             <Filter className="ml-2 h-4 w-4" />
          </div>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue('companyName')}</div>,
    },
     {
      accessorKey: 'companyId',
      header: 'Company ID',
    },
     {
      accessorKey: 'finInputSector',
      header: 'Fin. Input Sector',
    },
    {
      accessorKey: 'listed',
      header: ({ column }) => (
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Listed
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Filter className="ml-2 h-4 w-4" />
          </div>
      ),
    },
     {
      accessorKey: 'cycle',
      header: 'Cycle',
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
      ),
    },
  ];

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

  const isBulkActionDisabled = Object.keys(rowSelection).length <= 1 || table.getIsAllPageRowsSelected();
  
  const handleExport = () => {
    toast({
      title: "Export Initiated",
      description: "This is a placeholder for the table export functionality.",
    });
  }

  return (
    <div className="w-full">
        <div className="flex items-center pb-4">
             <div className="flex items-center gap-2 ml-auto">
                <Select disabled={isBulkActionDisabled}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Bulk Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="assign-maker">Assign Maker</SelectItem>
                        <SelectItem value="assign-checker">Assign Checker</SelectItem>
                        <SelectItem value="close-requests">Close Requests</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline" size="icon" onClick={handleExport}><Download className="h-5 w-5" /></Button>
                 <Button variant="outline" size="icon"><Filter className="h-5 w-5" /></Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="outline" size="icon"><Settings className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                        {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                            {column.id}
                        </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
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
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
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
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
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
    </div>
  );
}
    
