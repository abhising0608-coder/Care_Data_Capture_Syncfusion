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
    { id: 'C001', tabName: 'P&L', rowNo: 73, date: '2024-06-25 10:30 AM', errorType: 'Classification Error', subType: 'Wrong head', details: 'Share of minority interest should be under "Other Income"', status: 'Pending' },
    { id: 'C002', tabName: 'Assets', rowNo: 15, date: '2024-06-25 10:32 AM', errorType: 'Data Entry Error', subType: 'Value mismatch', details: 'Goodwill amount differs from audited financials', status: 'Pending' },
    { id: 'C003', tabName: 'Cash Flow', rowNo: 22, date: '2024-06-25 10:35 AM', errorType: 'Formula Error', subType: 'Incorrect formula', details: 'Net cash flow calculation is incorrect', status: 'Corrected' },
];

export function CorrectionLogTable() {
    const { toast } = useToast();
    const [data, setData] = React.useState(mockCorrections);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    
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
          accessorKey: 'tabName',
          header: 'Tab Name',
          cell: ({ row }) => <Button variant="link" className="p-0 h-auto">{row.getValue('tabName')}</Button>,
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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Correction Log</CardTitle>
                    <CardDescription>Review and address the corrections flagged by the checker.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => toast({title: "Placeholder", description: "Export to CSV"})}>
                        <FileText className="h-5 w-5 text-green-700" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => toast({title: "Placeholder", description: "Export to XLS"})}>
                        <FileSpreadsheet className="h-5 w-5 text-blue-700" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => toast({title: "Placeholder", description: "Export to PDF"})}>
                        <FileJson className="h-5 w-5 text-red-700" />
                    </Button>
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
                <div className="flex justify-end">
                    <Button onClick={() => toast({title: "Placeholder", description: "Send to checker functionality"})}>Send to Checker</Button>
                </div>
            </CardContent>
        </Card>
    )
}
