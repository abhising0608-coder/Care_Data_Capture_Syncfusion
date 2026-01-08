
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import {
  Download,
  Filter,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import type { CKCRequest } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useWorkflow } from '@/context/workflow-context';

type SortConfig = {
  key: keyof CKCRequest;
  direction: 'ascending' | 'descending';
} | null;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatTimestamp = (timestamp: string | Date | undefined | null) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function AcceptedRequestsList() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<{
    cycle: string[];
    listed: string[];
    auditedFY: string[];
    ckcAnalystName: string[];
    status: string[];
  }>({
    cycle: [],
    listed: [],
    auditedFY: [],
    ckcAnalystName: [],
    status: [],
  });
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'receiptDateTime', direction: 'descending' });
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { toast } = useToast();
  const router = useRouter();
  const { user, claims, isLoading: isUserLoading } = useAuth();
  const { startWorkflow } = useWorkflow();
  
  const { data: requests, isLoading } = useSWR<CKCRequest[]>('/api/requests?status=ACCEPTED', fetcher);
  
  const handleInitiate = (requestId: string) => {
    toast({
      title: 'Initiating Rating Workflow',
      description: `Loading company information for request ${requestId}.`,
    });
    startWorkflow(requestId);
    router.push(`/company-information/${requestId}`);
  };

  const filteredRequests = React.useMemo(() => {
    if (!requests) return [];
    let analystFilteredRequests = requests;
    // If user is not an admin, filter by their UID
    if (user && claims && !claims.isAdmin) {
      analystFilteredRequests = requests.filter(r => r.assignedTo === user.uid);
    }
    
    return analystFilteredRequests.filter((req) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        req.id.toLowerCase().includes(searchTermLower) ||
        req.companyName.toLowerCase().includes(searchTermLower) ||
        req.companyId.toLowerCase().includes(searchTermLower) ||
        (req.ckcAnalystName || '').toLowerCase().includes(searchTermLower) ||
        req.cycle.toLowerCase().includes(searchTermLower) ||
        req.auditedFY.some((fy) => fy.includes(searchTermLower)) ||
        req.status.toLowerCase().includes(searchTermLower);

      const matchesFilters =
        (filters.cycle.length === 0 || filters.cycle.includes(req.cycle)) &&
        (filters.listed.length === 0 || filters.listed.includes(req.listed)) &&
        (filters.auditedFY.length === 0 || req.auditedFY.some(fy => filters.auditedFY.includes(fy))) &&
        (filters.ckcAnalystName.length === 0 || (req.ckcAnalystName && filters.ckcAnalystName.includes(req.ckcAnalystName))) &&
        (filters.status.length === 0 || filters.status.includes(req.status));

      return matchesSearch && matchesFilters;
    });
  }, [requests, searchTerm, filters, user, claims]);

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
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const KpiCard = ({ title, value, description }: { title: string, value: string | number, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading || isUserLoading ? <Skeleton className="h-8 w-1/2" /> : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const headers: { key: keyof CKCRequest; label: string; }[] = [
    { key: 'id', label: 'Request ID' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'companyId', label: 'Company ID' },
    { key: 'listed', label: 'Listed' },
    { key: 'cycle', label: 'Cycle' },
    { key: 'receiptDateTime', label: 'Received Date' },
    { key: 'auditedFY', label: 'Audited FY' },
    { key: 'ckcAnalystName', label: 'CKC Analyst Name' },
    { key: 'status', label: 'Status' },
  ];

  const uniqueAnalysts = Array.from(new Set(requests?.map(r => r.ckcAnalystName).filter(Boolean)));
  const uniqueAuditedFYs = Array.from(new Set(requests?.flatMap(r => r.auditedFY)));

  const myAcceptedCount = React.useMemo(() => {
    if (!requests || !user) return 0;
    // If admin, show all. If not, filter by assignedTo.
    if (claims?.isAdmin) return requests.length;
    return requests.filter(r => r.assignedTo === user.uid).length;
  }, [requests, user, claims]);


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="My Accepted Requests" value={myAcceptedCount} description="Requests you are currently working on." />
        <KpiCard title="Initial Cycle" value={requests?.filter(r => r.cycle === 'Initial').length || 0} description="Initial rating requests." />
        <KpiCard title="Surveillance Cycle" value={requests?.filter(r => r.cycle === 'Surveillance').length || 0} description="Surveillance requests." />
        <KpiCard title="Overdue" value="0" description="Tasks past their due date." />
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search accepted requests..."
                className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px]"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Add other filters here based on available data */}
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
                  {headers.map((header) => (
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
                {isLoading || isUserLoading ? (
                  Array.from({ length: pagination.pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={headers.length + 1}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedRequests.length > 0 ? (
                  paginatedRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <Link href={`/operational-input/request/${req.id}`} className="text-primary hover:underline">
                          {req.id}
                        </Link>
                      </TableCell>
                      <TableCell>{req.companyName}</TableCell>
                      <TableCell>{req.companyId}</TableCell>
                      <TableCell>
                        <Badge variant={req.listed === 'Yes' ? 'default' : 'secondary'}>
                          {req.listed}
                        </Badge>
                      </TableCell>
                      <TableCell>{req.cycle}</TableCell>
                      <TableCell>{formatTimestamp(req.receiptDateTime)}</TableCell>
                      <TableCell>{req.auditedFY.join(', ')}</TableCell>
                      <TableCell>{req.ckcAnalystName || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInitiate(req.id)}
                          aria-label={`Initiate request ${req.id}`}
                          disabled={claims && claims.isAdmin}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Initiate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={headers.length + 1}
                      className="h-24 text-center"
                    >
                      No accepted requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                sortedRequests.length
              )}{' '}
              of {sortedRequests.length} requests
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${pagination.pageSize}`}
                  onValueChange={(value) => {
                    setPagination({
                      ...pagination,
                      pageSize: Number(value),
                      pageIndex: 0,
                    });
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
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      pageIndex: pagination.pageIndex - 1,
                    })
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      pageIndex: pagination.pageIndex + 1,
                    })
                  }
                  disabled={pagination.pageIndex >= pageCount - 1}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() =>
                    setPagination({ ...pagination, pageIndex: pageCount - 1 })
                  }
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
    </>
  );
}
