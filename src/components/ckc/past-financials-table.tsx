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
} from '@tanstack/react-table';
import { ArrowUpDown, Search, UserCheck } from 'lucide-react';
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
import type { PastFinancialPeriod } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';
import { GrantRightsModal } from './grant-rights-modal';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PastFinancialsTableProps {
  companyId: string;
}

export function PastFinancialsTable({ companyId }: PastFinancialsTableProps) {
  const { data, isLoading } = useSWR<PastFinancialPeriod[]>(
    companyId ? `/api/ckc/requests/${companyId}/past-financials` : null,
    fetcher
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns: ColumnDef<PastFinancialPeriod>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'periodId',
      header: 'Period ID',
      cell: ({ row }) => <div className="text-blue-600 font-medium">{row.getValue('periodId')}</div>,
    },
    {
      accessorKey: 'period',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Period <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: 'resultType', header: 'Result Type' },
    { accessorKey: 'financialStatus', header: 'Financial Status' },
    { accessorKey: 'operationalStatus', header: 'Operational Status' },
    {
      accessorKey: 'kpuMaker',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          KPU Maker <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'kpuChecker',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          KPU Checker <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: 'ratingAnalyst', header: 'Rating Analyst' },
    { accessorKey: 'updatedBy', header: 'Updated by' },
    { accessorKey: 'updatedOn', header: 'Updated on' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'Active' ? 'default' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      ),
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });
  
  const handleGrantRights = () => setIsModalOpen(true);
  const handleConfirmGrant = () => {
    setIsModalOpen(false);
    // Logic to grant rights would go here
    console.log("Rights granted for selected rows:", Object.keys(rowSelection));
    setRowSelection({}); // Clear selection after granting
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startingRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endingRow = totalRows > 0 ? Math.min((pageIndex + 1) * pageSize, totalRows) : 0;

  return (
    <>
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end gap-2">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by period ID..."
                value={(table.getColumn('periodId')?.getFilterValue() as string) ?? ''}
                onChange={event =>
                table.getColumn('periodId')?.setFilterValue(event.target.value)
                }
                className="max-w-sm pl-10"
            />
        </div>
        <Button onClick={handleGrantRights} disabled={Object.keys(rowSelection).length === 0}>
          <UserCheck className="mr-2 h-4 w-4" /> Grant Rights
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
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
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
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
                  No past financial data available.
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
            onValueChange={value => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map(pageSize => (
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
            <Button
              key={page}
              variant={pageIndex + 1 === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => table.setPageIndex(page - 1)}
            >
              {page}
            </Button>
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
    <GrantRightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmGrant}
     />
    </>
  );
}
    