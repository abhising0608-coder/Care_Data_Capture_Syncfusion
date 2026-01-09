'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OperationalRequestsTable } from './requests-table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const summaryCards = [
    { title: "Card 1", count: 103, color: "text-blue-600" },
    { title: "Card 2", count: 28, color: "text-orange-600" },
    { title: "Card 3", count: 75, color: "text-green-600" },
    { title: "Card 4", count: 30, color: "text-purple-600" },
    { title: "Card 5", count: 20, color: "text-teal-600" },
];


export default function OperationalRequestsClient() {
    const [activeTab, setActiveTab] = useState("pending");
    const [globalFilter, setGlobalFilter] = useState('');

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Requests</h1>
            </header>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent p-0 border-b rounded-none w-full justify-start">
                    <TabsTrigger value="pending">Pending (309)</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted (3)</TabsTrigger>
                    <TabsTrigger value="closed">Closed (126)</TabsTrigger>
                </TabsList>

                <div className="pt-6">
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

                <TabsContent value="pending"><OperationalRequestsTable status="PENDING" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="accepted"><OperationalRequestsTable status="ACCEPTED" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
                <TabsContent value="closed"><OperationalRequestsTable status="CLOSED" globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} /></TabsContent>
            </Tabs>
        </div>
    )
}
