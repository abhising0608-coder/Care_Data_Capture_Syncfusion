'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import {
  ArrowUpDown,
  MoreVertical,
  Search,
  Triangle,
  Square,
  Dot,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import type { RatingNote, NoteStatus, Role } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

const StatusIndicator = ({ status, role }: { status: NoteStatus, role: Role | undefined }) => {
    const baseClasses = "flex items-center gap-2";
    
    let displayStatus = status;
    if (role === 'GROUP_HEAD' && status === 'In Review (GH)') {
        displayStatus = 'In Review' as NoteStatus;
    }

    switch (status) {
        case 'Completed':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-green-500 text-green-500" /><span>Completed</span></div>;
        case 'Draft':
             return <div className={baseClasses}><Dot className="h-3 w-3 fill-blue-500 text-blue-500" /><span>Draft</span></div>;
        case 'In Review (GH)':
             return <div className={baseClasses}><Dot className="h-3 w-3 fill-yellow-500 text-yellow-500" /><span>{displayStatus}</span></div>;
        case 'Rework Requested':
             return <div className={baseClasses}><Dot className="h-3 w-3 fill-orange-500 text-orange-500" /><span>Rework Requested</span></div>;
        case 'In Review (QC)':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-cyan-500 text-cyan-500" /><span>In Review (QC)</span></div>;
        case 'QC Approved':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-teal-500 text-teal-500" /><span>QC Approved</span></div>;
        case 'Rework Requested (GH)':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-pink-500 text-pink-500" /><span>Rework Requested (GH)</span></div>;
        case 'In Review (CC)':
             return <div className={baseClasses}><Dot className="h-3 w-3 fill-indigo-500 text-indigo-500" /><span>In Review (CC)</span></div>;
        case 'CC Approved':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-lime-500 text-lime-500" /><span>CC Approved</span></div>;
        case 'Pending RR & PR (RA)':
            return <div className={baseClasses}><Dot className="h-3 w-3 fill-blue-500 text-blue-500" /><span>Pending RR & PR</span></div>;
        case 'In Final Review (GH)':
             return <div className={baseClasses}><Dot className="h-3 w-3 fill-yellow-500 text-yellow-500" /><span>In Final Review</span></div>;
        default:
            return <span>{status}</span>;
    }
};


export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, role } = useAuth();
  
  const { data: notes, isLoading: isNotesLoading } = useSWR<RatingNote[]>(
      user ? `/api/notes?role=${user.role}&userId=${user.uid}` : null, 
      fetcher
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const handleAction = (note: RatingNote) => {
    if (!user) return;

    if (note.status === 'Pending RR & PR (RA)') {
        router.push(`/rating-note/final-documents/${note.id}`);
        return;
    }

    switch(user.role) {
        case 'RATING_ANALYST':
            router.push(`/rating-note/${note.id}`);
            break;
        case 'GROUP_HEAD':
             router.push(`/gh-review/${note.id}`);
             break;
        case 'QC':
            router.push(`/qc-review/${note.id}`);
            break;
        case 'RATING_COMMITTEE':
            router.push(`/cc-review/${note.id}`);
            break;
        default:
            // Default view action if any
            router.push(`/rating-note/${note.id}`);
            break;
    }
  };

  const getActionText = (role: Role | undefined, note: RatingNote): string => {
    if (!role) return 'View Note';
    if (note.status === 'Pending RR & PR (RA)') {
        return 'Generate RR & PR';
    }
    switch (role) {
      case 'RATING_ANALYST':
        return 'Edit Note';
      case 'GROUP_HEAD':
        return 'Review Note';
      case 'QC':
        return 'Review Note';
      case 'RATING_COMMITTEE':
        return 'Review Note';
      default:
        return 'View Note';
    }
  }


  const columns: ColumnDef<RatingNote>[] = [
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
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Company Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue('companyName')}</div>,
    },
    {
      accessorKey: 'ratingCycle',
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Rating Cycle
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('ratingCycle')}</div>,
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <PriorityIndicator priority={row.getValue('priority')} />,
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('dueDate')}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusIndicator status={row.getValue('status')} role={user?.role} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const note = row.original;
        return (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction(note)}>
                {getActionText(user?.role, note)}
              </DropdownMenuItem>
              <DropdownMenuItem>View Company Summary</DropdownMenuItem>
              <DropdownMenuItem>View Workflow Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  const table = useReactTable({
    data: notes || [],
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

  const isLoading = isAuthLoading || isNotesLoading;

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
                    <Search className="h-5 w-5 text-muted-foreground" />
                </div>
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
               Array.from({ length: 5 }).map((_, i) => (
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
                  No relevant notes found for your role.
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
