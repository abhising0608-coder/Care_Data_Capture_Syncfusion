'use client';

import * as React from 'react';
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
  Search,
  Check,
  X,
  FileText,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/firebase';

interface Correction {
    id: string;
    tabName: string;
    rowNo: number;
    date: string;
    errorType: string;
    subType: string;
    details: string;
    status: 'Pending' | 'Corrected';
}

const mockCorrections: Correction[] = [
    { id: 'C001', tabName: 'P&L', rowNo: 2, date: '01-11-2024', errorType: 'P&L', subType: 'Classification', details: 'Sed nec massa ultricies, sodales elit ac', status: 'Corrected' },
    { id: 'C002', tabName: 'Assets', rowNo: 2, date: '01-11-2024', errorType: 'P&L', subType: 'Classification', details: 'Nunc condimentum diam ut lorem ullamcorper', status: 'Corrected' },
    { id: 'C003', tabName: 'Cash Flow', rowNo: 3, date: '01-11-2024', errorType: 'P&L', subType: 'Classification', details: 'Sed nec massa ultricies, sodales elit ac', status: 'Corrected' },
    { id: 'C004', tabName: 'P&L', rowNo: 4, date: '01-11-2024', errorType: 'P&L', subType: 'Classification', details: 'Suspendisse ultricies convallis erat eu lacinia', status: 'Corrected' },
    { id: 'C005', tabName: 'P&L', rowNo: 5, date: '01-11-2024', errorType: 'P&L', subType: 'Classification', details: 'Nullam porttitor, est sed bibendum semper', status: 'Corrected' },
    { id: 'C006', tabName: 'P&L', rowNo: 6, date: '01-11-2024', errorType: 'P&L', subType: 'Classification', details: 'Cras ipsum magna, congue eu interdum vitae', status: 'Corrected' },
    { id: 'C007', tabName: 'Operations', rowNo: 7, date: '01-11-2024', errorType: 'Operations', subType: 'Others', details: 'Nullam consequat hendrerit auctor', status: 'Corrected' },
    { id: 'C008', tabName: 'Operations', rowNo: 8, date: '01-11-2024', errorType: 'Operations', subType: 'Others', details: 'Orci varius natoque penatibus et magnis dis...', status: 'Corrected' },
    { id: 'C009', tabName: 'Operations', rowNo: 9, date: '01-11-2024', errorType: 'Operations', subType: 'Omission', details: 'Phasellus mi neque, rhoncus vitae feugiat', status: 'Corrected' },
    { id: 'C010', tabName: 'Operations', rowNo: 10, date: '01-11-2024', errorType: 'Operations', subType: 'Others', details: 'Morbi augue velit, eleifend ac nisi vitae', status: 'Corrected' },
];

export function CorrectionLogTable() {
    const { toast } = useToast();
    const [data, setData] = React.useState(mockCorrections);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const { user } = useAuth();
    // This is a mock distinction. In a real app, the checker role would be more explicit.
    const isChecker = user?.role === 'CKC_CHECKER' || user?.role === 'CKC_ADMIN'; // Let's assume Admin can also act as Checker
    
    const handleStatusUpdate = (correctionId: string, isCorrected: boolean) => {
        setData(prevData =>
            prevData.map(item =>
                item.id === correctionId ? { ...item, status: isCorrected ? 'Corrected' : 'Pending' } : item
            )
        );
        toast({
            title: 'Status Updated',
            description: `Correction ${correctionId} has been marked as ${isCorrected ? 'Corrected' : 'Pending'}.`
        });
    };

    const columns: ColumnDef<Correction>[] = [
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
          accessorKey: 'rowNo',
          header: 'Row No',
          cell: ({ row }) => <Button variant="link" className="p-0 h-auto">{row.getValue('rowNo')}</Button>,
        },
        {
          accessorKey: 'date',
          header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
        },
        { accessorKey: 'errorType', header: 'Type of Error' },
        { accessorKey: 'subType', header: 'Sub Type of Error' },
        { 
            accessorKey: 'details', 
            header: 'Details of Error',
            cell: ({ row }) => <div className="max-w-[250px] truncate">{row.getValue('details')}</div>
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ row }) => (
            <Badge variant={row.getValue('status') === 'Corrected' ? 'default' : 'destructive'}>
              {row.getValue('status')}
            </Badge>
          ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const correction = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleStatusUpdate(correction.id, true)}>
                            <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleStatusUpdate(correction.id, false)}>
                            <X className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                )
            }
        }
    ];

    const table = useReactTable({
        data,
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

    return (
        <Card>
            <CardHeader>
                 <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Correction Log</CardTitle>
                        <CardDescription>Review and address the corrections flagged by the checker.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {isChecker && <Button variant="outline" onClick={() => toast({title: "Placeholder", description: "Send back to maker"})}>Send back to Maker</Button>}
                        <Button variant="outline" size="icon" onClick={() => toast({title: "Placeholder", description: "Export to PDF"})}>
                            <FileJson className="h-5 w-5 text-red-700" />
                        </Button>
                         <Button variant="outline" size="icon" onClick={() => toast({title: "Placeholder", description: "Export to CSV"})}>
                            <FileText className="h-5 w-5 text-green-700" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => toast({title: "Placeholder", description: "Export to XLS"})}>
                            <FileSpreadsheet className="h-5 w-5 text-blue-700" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
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
                            {table.getRowModel().rows?.length ? (
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
                                No corrections found.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing 1 - {table.getPaginationRowModel().rows.length} of {table.getFilteredRowModel().rows.length} entries
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
                            variant={table.getState().pagination.pageIndex + 1 === page ? 'default' : 'outline'}
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
                <div className="flex justify-end gap-4">
                    {isChecker ? (
                        <>
                            <Button onClick={() => toast({title: "Placeholder", description: "Send back to maker functionality"})}>Send back to Maker</Button>
                            <Button onClick={() => toast({title: "Placeholder", description: "Mark as complete functionality"})}>Mark as Complete</Button>
                        </>
                    ) : (
                        <Button onClick={() => toast({title: "Placeholder", description: "Send to checker functionality"})}>Send to Checker</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
