'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  Triangle,
  Square,
  Circle as Dot,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { mockCompanies } from '@/lib/mock-data';
import type { CompanyDashboard } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PriorityIndicator = ({ priority }: { priority: 'High' | 'Medium' | 'Low' }) => {
  const styles = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-orange-100 text-orange-700',
    Low: 'bg-green-100 text-green-700',
  };
  const icons = {
    High: <Triangle className="h-3 w-3 fill-current" />,
    Medium: <Square className="h-3 w-3 fill-current" />,
    Low: <Dot className="h-3 w-3 fill-current" />,
  };
  return (
    <Badge variant="outline" className={cn('font-normal border-0', styles[priority])}>
      {icons[priority]}
      <span className="ml-2">{priority}</span>
    </Badge>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
    const baseClasses = "flex items-center gap-2";
    switch (status) {
        case 'Completed':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-green-500 text-green-500" /><span>Completed</span></div>;
        case 'In Progress':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-blue-500 text-blue-500" /><span>In Progress</span></div>;
        case 'New':
            return <div className="relative flex items-center gap-2"><Dot className="h-3 w-3 fill-purple-500 text-purple-500" /><span className="absolute -left-1 -top-1 w-5 h-5 border-2 border-dashed border-purple-500 rounded-full"></span><span>New</span></div>;
        case 'Not Started':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-gray-400 text-gray-400" /><span>Not Started</span></div>;
        default:
            return <span>{status}</span>;
    }
};

const columns: ColumnDef<CompanyDashboard>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
    accessorKey: 'companyName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Company Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <Link href={`/company-information/${row.original.id}`} className="capitalize text-primary hover:underline">{row.getValue('companyName')}</Link>,
  },
  {
    accessorKey: 'ratingCycle',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Rating Cycle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('ratingCycle')}</div>,
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
       return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <PriorityIndicator priority={row.getValue('priority')} />,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => {
       return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('dueDate')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusIndicator status={row.getValue('status')} />,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export default function DashboardClient() {
  const [data] = React.useState<CompanyDashboard[]>(() => mockCompanies);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
        <div className="flex items-center py-4">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="ml-auto relative">
                <Input
                placeholder="Search companies..."
                value={(table.getColumn('companyName')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('companyName')?.setFilterValue(event.target.value)
                }
                className="max-w-sm pl-10"
                />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                </div>
            </div>
        </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
                  No results.
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
                <p className="text-sm font-medium">1 - {table.getState().pagination.pageSize} of {table.getFilteredRowModel().rows.length} entries</p>
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
            <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Previous
                </Button>
                {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(page => (
                    <Button key={page} variant={table.getState().pagination.pageIndex + 1 === page ? 'default' : 'outline'} size="sm" onClick={() => table.setPageIndex(page - 1)}>{page}</Button>
                )).slice(0, 3)}
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
    </div>
  );
}
