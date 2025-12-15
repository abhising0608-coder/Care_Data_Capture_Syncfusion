'use client';

import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Check,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockRequests } from '@/lib/data';
import type { CKCRequest } from '@/lib/definitions';
import { Badge } from '../ui/badge';

type SortConfig = {
  key: keyof CKCRequest;
  direction: 'ascending' | 'descending';
} | null;

export function RequestsList() {
  const [requests, setRequests] = React.useState<CKCRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<{ listed: string[]; cycle: string[] }>({ listed: [], cycle: [] });
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(null);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const { toast } = useToast();

  const handleAccept = (requestId: string) => {
    // This simulates a server action.
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
    toast({
      title: 'Success',
      description: `Request ${requestId} has been accepted.`,
    });
  };

  const filteredRequests = React.useMemo(() => {
    let filtered = requests.filter((req) =>
      req.status === 'PENDING' &&
      (
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.companyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.cycle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.auditedFY.some(fy => fy.includes(searchTerm))
      )
    );

    if (filters.listed.length > 0) {
      filtered = filtered.filter(req => filters.listed.includes(req.listed));
    }
    if (filters.cycle.length > 0) {
      filtered = filtered.filter(req => filters.cycle.includes(req.cycle));
    }

    return filtered;
  }, [requests, searchTerm, filters]);
  
  const sortedRequests = React.useMemo(() => {
    let sortableItems = [...filteredRequests];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRequests, sortConfig]);

  const paginatedRequests = React.useMemo(() => {
    const { pageIndex, pageSize } = pagination;
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedRequests.slice(start, end);
  }, [sortedRequests, pagination]);

  const pageCount = Math.ceil(sortedRequests.length / pagination.pageSize);

  const requestSort = (key: keyof CKCRequest) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const KpiCard = ({ title, value, description }: { title: string, value: string, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const headers: { key: keyof CKCRequest, label: string }[] = [
    { key: 'id', label: 'Request ID' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'companyId', label: 'Company ID' },
    { key: 'listed', label: 'Listed' },
    { key: 'cycle', label: 'Cycle' },
    { key: 'receiptDateTime', label: 'Received Date' },
    { key: 'auditedFY', label: 'Audited FY' },
  ];

  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="accepted">Accepted</TabsTrigger>
        <TabsTrigger value="closed">Closed</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KpiCard title="Pending Requests" value={requests.length.toString()} description="Total requests waiting for acceptance." />
            <KpiCard title="Accepted by Me" value="12" description="Requests you are currently working on." />
            <KpiCard title="Total Requests Today" value="89" description="Across all analysts." />
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px]"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
              />
            </div>
            <div className='flex gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Listed</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.listed.includes('Yes')}
                    onCheckedChange={(checked) => setFilters(f => ({...f, listed: checked ? [...f.listed, 'Yes'] : f.listed.filter(i => i !== 'Yes')}))}
                  >
                    Yes
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.listed.includes('No')}
                    onCheckedChange={(checked) => setFilters(f => ({...f, listed: checked ? [...f.listed, 'No'] : f.listed.filter(i => i !== 'No')}))}
                  >
                    No
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                   <DropdownMenuLabel>Cycle</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.cycle.includes('Initial')}
                    onCheckedChange={(checked) => setFilters(f => ({...f, cycle: checked ? [...f.cycle, 'Initial'] : f.cycle.filter(i => i !== 'Initial')}))}
                  >
                    Initial
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.cycle.includes('Surveillance')}
                    onCheckedChange={(checked) => setFilters(f => ({...f, cycle: checked ? [...f.cycle, 'Surveillance'] : f.cycle.filter(i => i !== 'Surveillance')}))}
                  >
                    Surveillance
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map(header => (
                      <TableHead key={header.key}>
                        <Button variant="ghost" onClick={() => requestSort(header.key)}>
                          {header.label}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">
                          <Link href={`/operational-input/request/${req.id}`} className="text-primary hover:underline">
                            {req.id}
                          </Link>
                        </TableCell>
                        <TableCell>{req.companyName}</TableCell>
                        <TableCell>{req.companyId}</TableCell>
                        <TableCell><Badge variant={req.listed === 'Yes' ? 'default' : 'secondary'}>{req.listed}</Badge></TableCell>
                        <TableCell>{req.cycle}</TableCell>
                        <TableCell>{format(req.receiptDateTime, 'PP')}</TableCell>
                        <TableCell>{req.auditedFY.join(', ')}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleAccept(req.id)} aria-label={`Accept request ${req.id}`}>
                            <Check className="h-5 w-5 text-accent" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {pagination.pageIndex * pagination.pageSize + 1}-
                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, sortedRequests.length)} of{' '}
                    {sortedRequests.length} requests
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${pagination.pageSize}`}
                            onValueChange={(value) => {
                                setPagination({ ...pagination, pageSize: Number(value), pageIndex: 0 });
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {pagination.pageIndex + 1} of {pageCount}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPagination({ ...pagination, pageIndex: 0 })}
                            disabled={pagination.pageIndex === 0}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                            disabled={pagination.pageIndex === 0}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                            disabled={pagination.pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPagination({ ...pagination, pageIndex: pageCount - 1 })}
                            disabled={pagination.pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="accepted">
        <p className="text-muted-foreground">Accepted requests will appear here.</p>
      </TabsContent>
      <TabsContent value="closed">
        <p className="text-muted-foreground">Closed requests will appear here.</p>
      </TabsContent>
    </Tabs>
  );
}
