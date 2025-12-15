'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
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
import type { CKCRequest } from '@/lib/definitions';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useCollection } from '@/firebase/firestore/use-collection';

type SortConfig = {
  key: keyof CKCRequest;
  direction: 'ascending' | 'descending';
} | null;

const formatFirestoreTimestamp = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) return 'N/A';
  // Check if it's a Firestore Timestamp and has the toDate method
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  // Fallback for strings or other types
  return String(timestamp);
};


export function ClosedRequestsList() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<{
    cycle: string[];
    listed: string[];
    auditedFY: string[];
    ckcAnalystName: string[];
    overallStatus: string[];
  }>({
    cycle: [],
    listed: [],
    auditedFY: [],
    ckcAnalystName: [],
    overallStatus: [],
  });
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'checkingCompletedDateTime', direction: 'descending' });
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const firestore = useFirestore();
  const { user, claims, isUserLoading } = useUser();

  const closedRequestsQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading) return null;

    const requestsRef = collection(firestore, 'ckc_operational_requests');
    let q = query(requestsRef, where('status', '==', 'CLOSED'));
    
    if (user && claims && !claims.isAdmin) {
      q = query(q, where('assignedTo', '==', user.uid));
    }
    
    return q;
  }, [firestore, user, claims, isUserLoading]);

  const { data: requests, isLoading } = useCollection<CKCRequest>(closedRequestsQuery);

  const filteredRequests = React.useMemo(() => {
    if (!requests) return [];
    return requests.filter((req) => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
            (req.id?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.companyName?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.companyId?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.ckcAnalystName?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.cycle?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.overallStatus?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.auditedFY?.some((fy) => fy.toLowerCase().includes(searchTermLower))) ||
            (req.financialInputSector?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.rating?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.hoRoName?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.dealingAnalyst?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.groupHead?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.checker?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.itemType?.toLowerCase() ?? '').includes(searchTermLower) ||
            (req.resultType?.toLowerCase() ?? '').includes(searchTermLower);

      const matchesFilters =
        (filters.cycle.length === 0 || filters.cycle.includes(req.cycle)) &&
        (filters.listed.length === 0 || filters.listed.includes(req.listed)) &&
        (filters.auditedFY.length === 0 || req.auditedFY.some(fy => filters.auditedFY.includes(fy))) &&
        (filters.ckcAnalystName.length === 0 || (req.ckcAnalystName && filters.ckcAnalystName.includes(req.ckcAnalystName))) &&
        (filters.overallStatus.length === 0 || (req.overallStatus && filters.overallStatus.includes(req.overallStatus)));

      return matchesSearch && matchesFilters;
    });
  }, [requests, searchTerm, filters]);

  const sortedRequests = React.useMemo(() => {
    let sortableItems = [...filteredRequests];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

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
    { key: 'financialInputSector', label: 'Financial Input Sector' },
    { key: 'listed', label: 'Listed' },
    { key: 'rating', label: 'Rating' },
    { key: 'hoRoName', label: 'HO/RO Name' },
    { key: 'dealingAnalyst', label: 'Dealing Analyst' },
    { key: 'groupHead', label: 'Group Head' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'checker', label: 'Checker' },
    { key: 'status', label: 'Status' },
    { key: 'auditedFY', label: 'Audited FY' },
    { key: 'provisionalFY', label: 'Provisional FY' },
    { key: 'projectionFY', label: 'Projection FY' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'receiptDateTime', label: 'Receipt Date & Time' },
    { key: 'entryCompletedDateTime', label: 'Entry Completed' },
    { key: 'checkingCompletedDateTime', label: 'Checking Completed' },
    { key: 'overallStatus', label: 'Overall Status' },
    { key: 'itemType', label: 'Item Type' },
    { key: 'resultType', label: 'Result Type' },
    { key: 'ckcAnalystName', label: 'CKC Analyst Name' },
    { key: 'cycle', label: 'Cycle' },
  ];

  const visibleHeaders = [
    { key: 'id', label: 'Request ID' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'companyId', label: 'Company ID' },
    { key: 'listed', label: 'Listed' },
    { key: 'cycle', label: 'Cycle' },
    { key: 'receiptDateTime', label: 'Received Date' },
    { key: 'auditedFY', label: 'Audited FY' },
    { key: 'ckcAnalystName', label: 'CKC Analyst Name' },
    { key: 'overallStatus', label: 'Overall Status' },
    { key: 'checkingCompletedDateTime', label: 'Closed Date' },
  ];

  const uniqueAnalysts = Array.from(new Set(requests?.map(r => r.ckcAnalystName).filter(Boolean) as string[]));
  const uniqueAuditedFYs = Array.from(new Set(requests?.flatMap(r => r.auditedFY) || []));
  const uniqueOverallStatus = Array.from(new Set(requests?.map(r => r.overallStatus).filter(Boolean) as string[]));
  
  const myClosedCount = React.useMemo(() => {
    if (!requests || !user) return 0;
    return requests.filter(r => r.assignedTo === user.uid).length;
  }, [requests, user]);


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="My Closed Requests" value={myClosedCount} description="Requests you have completed." />
        <KpiCard title="Total Closed" value={requests?.length ?? 0} description="All completed requests." />
        <KpiCard title="Completed On Time" value="N/A" description="Within service-level agreement." />
        <KpiCard title="Average Turnaround" value="N/A" description="Average time to close a request." />
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search closed requests..."
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
                    <DropdownMenuLabel>Cycle</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked={filters.cycle.includes('Initial')} onCheckedChange={(checked) => setFilters(f => ({...f, cycle: checked ? [...f.cycle, 'Initial'] : f.cycle.filter(i => i !== 'Initial')}))}>Initial</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={filters.cycle.includes('Surveillance')} onCheckedChange={(checked) => setFilters(f => ({...f, cycle: checked ? [...f.cycle, 'Surveillance'] : f.cycle.filter(i => i !== 'Surveillance')}))}>Surveillance</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Listed</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem checked={filters.listed.includes('Yes')} onCheckedChange={(checked) => setFilters(f => ({...f, listed: checked ? [...f.listed, 'Yes'] : f.listed.filter(i => i !== 'Yes')}))}>Yes</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={filters.listed.includes('No')} onCheckedChange={(checked) => setFilters(f => ({...f, listed: checked ? [...f.listed, 'No'] : f.listed.filter(i => i !== 'No')}))}>No</DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Audited FY</DropdownMenuLabel>
                    {uniqueAuditedFYs.map(fy => <DropdownMenuCheckboxItem key={fy} checked={filters.auditedFY.includes(fy)} onCheckedChange={(checked) => setFilters(f => ({...f, auditedFY: checked ? [...f.auditedFY, fy] : f.auditedFY.filter(i => i !== fy)}))}>{fy}</DropdownMenuCheckboxItem>)}
                    {claims?.isAdmin && <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>CKC Analyst</DropdownMenuLabel>
                      {uniqueAnalysts.map(analyst => <DropdownMenuCheckboxItem key={analyst} checked={filters.ckcAnalystName.includes(analyst)} onCheckedChange={(checked) => setFilters(f => ({...f, ckcAnalystName: checked ? [...f.ckcAnalystName, analyst] : f.ckcAnalystName.filter(i => i !== analyst)}))}>{analyst}</DropdownMenuCheckboxItem>)}
                    </>}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Overall Status</DropdownMenuLabel>
                    {uniqueOverallStatus.map(status => <DropdownMenuCheckboxItem key={status} checked={filters.overallStatus.includes(status)} onCheckedChange={(checked) => setFilters(f => ({...f, overallStatus: checked ? [...f.overallStatus, status] : f.overallStatus.filter(i => i !== status)}))}>{status}</DropdownMenuCheckboxItem>)}
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
                  {visibleHeaders.map((header) => (
                    <TableHead key={header.key}>
                      <Button variant="ghost" onClick={() => requestSort(header.key as keyof CKCRequest)}>
                        {header.label}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isUserLoading ? (
                  Array.from({ length: pagination.pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={visibleHeaders.length}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedRequests.length > 0 ? (
                  paginatedRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        <Link href={`/operational-input/request/${req.id}?mode=view`} className="text-primary hover:underline">
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
                      <TableCell>{formatFirestoreTimestamp(req.receiptDateTime)}</TableCell>
                      <TableCell>{Array.isArray(req.auditedFY) ? req.auditedFY.join(', ') : ''}</TableCell>
                      <TableCell>{req.ckcAnalystName || 'N/A'}</TableCell>
                      <TableCell>
                         <Badge variant="secondary">{req.overallStatus || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{formatFirestoreTimestamp(req.checkingCompletedDateTime)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={visibleHeaders.length}
                      className="h-24 text-center"
                    >
                      No closed requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {sortedRequests.length > 0 ? pagination.pageIndex + 1 : 0} of {pageCount}
              <span className="mx-2">|</span>
              {sortedRequests.length} total rows
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
