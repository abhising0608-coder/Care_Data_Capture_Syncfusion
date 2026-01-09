'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CKCRequestsTable } from './requests-table';
import { Card, CardContent } from '../ui/card';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Input } from '../ui/input';


const pendingSummaryCards = [
    { title: "Total Requests", count: 103, color: "text-blue-600" },
    { title: "Manufacturing", count: 28, color: "text-orange-600" },
    { title: "Bank", count: 75, color: "text-green-600" },
    { title: "NBFC", count: 30, color: "text-purple-600" },
    { title: "HFC", count: 20, color: "text-teal-600" },
    { title: "Insurance", count: 15, color: "text-pink-600" },
    { title: "Broker", count: 12, color: "text-yellow-600" },
];

const acceptedSummaryCards = [
    { title: "Not Allotted", count: 12, color: "text-gray-500" },
    { title: "WIP", count: 35, color: "text-blue-600" },
    { title: "Checking Pending", count: 18, color: "text-yellow-600" },
    { title: "CWIP", count: 8, color: "text-orange-600" },
    { title: "In-Review", count: 30, color: "text-purple-600" },
];

const closedSummaryCards = [
    { title: "Total Closed Requests", count: 103, color: "text-blue-600" },
    { title: "Manufacturing", count: 28, color: "text-orange-600" },
    { title: "Bank", count: 75, color: "text-green-600" },
    { title: "NBFC", count: 30, color: "text-purple-600" },
    { title: "HFC", count: 20, color: "text-teal-600" },
];


export default function CKCRequestsClient() {
    const [activeTab, setActiveTab] = useState("pending");
    const [globalFilter, setGlobalFilter] = useState('');
    
    const getSummaryCards = () => {
        switch (activeTab) {
            case 'pending': return pendingSummaryCards;
            case 'accepted': return acceptedSummaryCards;
            case 'closed': return closedSummaryCards;
            default: return [];
        }
    }
    
    const summaryCards = getSummaryCards();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Requests</h1>
            </header>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent p-0 border-b rounded-none w-full justify-start">
                    <TabsTrigger value="pending">Pending (09)</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted (103)</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected (32)</TabsTrigger>
                    <TabsTrigger value="closed">Closed (309)</TabsTrigger>
                    <TabsTrigger value="withdrawn">Withdrawn (29)</TabsTrigger>
                    <TabsTrigger value="on-hold">On Hold (12)</TabsTrigger>
                </TabsList>

                <div className="pt-6">
                    {summaryCards.length > 0 && (
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex w-max space-x-4 pb-4">
                                {summaryCards.map(card => (
                                    <Card key={card.title} className="w-52">
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground">{card.title}</p>
                                            <p className={`text-3xl font-bold ${card.color}`}>{card.count}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted">
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    )}
                </div>
                
                 <div className="py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={globalFilter}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="max-w-sm pl-10"
                        />
                    </div>
                </div>

                <TabsContent value="pending"><CKCRequestsTable status="PENDING" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="accepted"><CKCRequestsTable status="ACCEPTED" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="rejected"><CKCRequestsTable status="REJECTED" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="closed"><CKCRequestsTable status="CLOSED" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="withdrawn"><CKCRequestsTable status="WITHDRAWN" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="on-hold"><CKCRequestsTable status="ON_HOLD" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
            </Tabs>
        </div>
    )
}
