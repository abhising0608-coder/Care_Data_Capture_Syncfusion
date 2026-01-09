
'use client';

import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';
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
  Pencil
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
import { useAuth } from '@/firebase';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CKCRequestsTableProps {
  status: RequestStatus | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED' | 'WITHDRAWN' | 'ON_HOLD';
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
}


export function CKCRequestsTable({ status, globalFilter, setGlobalFilter }: CKCRequestsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  
  const { data: requests, isLoading } = useSWR<CKCRequest[]>(
      status ? `/api/ckc/requests?status=${status}` : null, 
      fetcher
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      'companyId': false,
      'status': status !== 'ACCEPTED',
      'rejectionComments': status !== 'REJECTED',
      'hoRoName': status !== 'CLOSED' && status !== 'ON_HOLD',
      'closedDate': status !== 'CLOSED',
      'analystName': status !== 'ACCEPTED' && status !== 'ON_HOLD',
      'withdrawalDate': status !== 'WITHDRAWN',
      'withdrawalReason': status !== 'WITHDRAWN',
      'onHoldDate': status !== 'ON_HOLD',
      'onHoldBy': status !== 'ON_HOLD',
    });
  const [rowSelection, setRowSelection] = React.useState({});
  
  const handleAcceptRequest = async (requestId: string) => {
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in to perform this action.', variant: 'destructive' });
        return;
    }
    
    try {
        toast({
            title: 'Request Accepted',
            description: `Request ${requestId} has been successfully accepted.`
        });
        mutate(`/api/ckc/requests?status=PENDING`, (currentData: CKCRequest[] | undefined) => {
            if (!currentData) return [];
            return currentData.filter(req => req.id !== requestId);
        }, false);

    } catch (error) {
        toast({ title: 'Error', description: 'Failed to accept the request.', variant: 'destructive' });
    }
  };

  const handleEditRequest = (requestId: string) => {
    toast({
        title: "Edit Action",
        description: `Placeholder to edit rejected request: ${requestId}`,
    });
  }


  const columns: ColumnDef<CKCRequest>[] = React.useMemo(() => [
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
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Request ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <Link href={`/operational-input/initiate?requestId=${row.getValue('id')}`} className="text-blue-600 hover:underline">{row.getValue('id')}</Link>,
    },
     {
      accessorKey: 'companyName',
      header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Company Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue('companyName')}</div>,
    },
     {
      accessorKey: 'companyId',
      header: 'Company ID',
    },
     {
      accessorKey: 'finInputSector',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Fin. Input Sector
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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
      accessorKey: 'hoRoName',
      header: 'HO / RO Name'
    },
    {
        accessorKey: 'receivedDate',
        header: 'Received Date'
    },
    {
        accessorKey: 'closedDate',
        header: 'Closed Date'
    },
    {
        accessorKey: 'auditedFY',
        header: 'Audited FY'
    },
     {
        accessorKey: 'analystName',
        header: 'Analyst Name'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      accessorFn: (row) => row.status === 'ACCEPTED' ? row.subStatus : row.status,
    },
    {
      accessorKey: 'rejectionComments',
      header: 'Rejection Comments'
    },
    {
        accessorKey: 'withdrawalDate',
        header: 'Withdrawal Date'
    },
    {
        accessorKey: 'withdrawalReason',
        header: 'Withdrawal Reason'
    },
     {
        accessorKey: 'onHoldDate',
        header: 'On Hold Date'
    },
    {
        accessorKey: 'onHoldBy',
        header: 'On Hold By'
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
         if (status === 'REJECTED') {
            return (
                 <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditRequest(row.original.id)}>
                    <Pencil className="h-4 w-4 text-blue-600" />
                </Button>
            )
        }
         if (status === 'ACCEPTED') {
             return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={row.getIsSelected()}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast({title: "Placeholder", description:"Assign to Maker & Checker"})}>Assign to Maker & Checker</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({title: "Placeholder", description:"Reject Request"})}>Reject Request</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({title: "Placeholder", description:"Withdraw Request"})}>Withdraw Request</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             )
         }
        return null;
      },
    },
  ], [status]);

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

  React.useEffect(() => {
    setColumnVisibility(prev => ({
        ...prev,
        'status': status !== 'ACCEPTED',
        'rejectionComments': status !== 'REJECTED',
        'hoRoName': status !== 'CLOSED' && status !== 'ON_HOLD',
        'closedDate': status !== 'CLOSED',
        'analystName': status !== 'ACCEPTED' && status !== 'ON_HOLD',
        'withdrawalDate': status !== 'WITHDRAWN',
        'withdrawalReason': status !== 'WITHDRAWN',
        'onHoldDate': status !== 'ON_HOLD',
        'onHoldBy': status !== 'ON_HOLD',
    }));
  }, [status]);


  const isBulkActionDisabled = Object.keys(rowSelection).length <= 1 || table.getIsAllPageRowsSelected();
  
  const handleExport = () => {
    toast({
      title: "Export Initiated",
      description: "This is a placeholder for the table export functionality.",
    });
  }

  const handleFilter = () => {
    toast({
      title: "Filter Clicked",
      description: "This is a placeholder for the column filtering UI.",
    });
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startingRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endingRow = totalRows > 0 ? Math.min((pageIndex + 1) * pageSize, totalRows) : 0;

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
                 <Button variant="outline" size="icon" onClick={handleFilter}><Filter className="h-5 w-5" /></Button>
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
  );
}

    