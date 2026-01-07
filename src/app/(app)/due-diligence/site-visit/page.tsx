'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/firebase';
import type { CompanyDashboard, SiteVisit } from '@/lib/definitions';
import { getCompaniesByRole } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Save, Mail } from 'lucide-react';
import { PlantVisitDetailsTab } from '@/components/due-diligence/site-visit/plant-visit-details';
import { OtherDetailsTab } from '@/components/due-diligence/site-visit/other-details';
import { WaiverRequestModal } from '@/components/due-diligence/site-visit/waiver-request-modal';
import { SiteVisitEmailModal } from '@/components/due-diligence/site-visit/site-visit-email-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formSchema = z.object({
    visitDate: z.date().nullable().optional(),
    careTeam: z.array(z.string()).min(1, 'CARE Team is mandatory'),
    plantVisited: z.string().min(1, 'Plant Visited is mandatory'),
    clientPersonnel: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required'),
        designation: z.string().min(1, 'Designation is required')
    })).min(1, 'At least one client personnel is required'),
    location: z.string().min(1, 'Location is mandatory'),
    productManufactured: z.string().min(1, 'Product is mandatory'),
    installedCapacity: z.string().min(1, 'Capacity is mandatory'),
    otherInfo: z.string().optional(),
});


export default function SiteVisitPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [companyToFetch, setCompanyToFetch] = useState<string>('');
    const [activeTab, setActiveTab] = useState('plant_visit');
    const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const companies = getCompaniesByRole(user);
    const selectedCompany = companies.find(c => c.id === companyToFetch);

    const { data: siteVisitData, isLoading: isDataLoading } = useSWR<SiteVisit>(
        companyToFetch ? `/api/due-diligence/site-visit?companyId=${companyToFetch}` : null,
        fetcher
    );

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            visitDate: null,
            careTeam: [],
            plantVisited: '',
            clientPersonnel: [],
            location: '',
            productManufactured: '',
            installedCapacity: '',
            otherInfo: '',
        }
    });

    const handleGoClick = () => setCompanyToFetch(selectedCompanyId);

    const handleSaveAndContinue = (data: any) => {
        toast({ title: 'Draft Saved', description: 'Plant visit details saved.' });
        setActiveTab('other_details');
    };

    const handleCancel = () => router.push('/dashboard');
    
    const handleWaiverSubmit = (reason: string) => {
         toast({
            title: 'Waiver Request Submitted',
            description: `Reason: ${reason}. Notification sent to SD for approval.`,
        });
        setIsWaiverModalOpen(false);
    };

    const isLoading = isAuthLoading || (companyToFetch && isDataLoading);
    const formData = form.watch();

    // Placeholder logic for mandatory visit
    const isMandatory = companyToFetch === 'COMP-101'; // Sun Pharma is >= BBB-

    return (
        <FormProvider {...form}>
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Site / Plant Visit</h1>
                    <p className="text-muted-foreground">Capture details of plant visits and manage waivers.</p>
                </header>

                 <Card>
                    <CardHeader>
                        <CardTitle>Company Selection</CardTitle>
                        <CardDescription>Select a company to manage site visit details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full items-center space-x-2">
                             <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                                <SelectTrigger className="max-w-sm"><SelectValue placeholder="Select a company" /></SelectTrigger>
                                <SelectContent>
                                    {isAuthLoading ? ( <SelectItem value="loading" disabled>Loading...</SelectItem> ) : (
                                        companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.companyName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleGoClick} disabled={!selectedCompanyId || isLoading}>GO</Button>
                            {isMandatory && companyToFetch && (
                                 <Button variant="outline" className="ml-auto" onClick={() => setIsWaiverModalOpen(true)}>
                                     <ShieldAlert className="mr-2 h-4 w-4" /> SD Approval for Waiver
                                 </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 {isLoading && ( <Skeleton className="h-96 w-full" /> )}

                {!isLoading && companyToFetch && (
                    <form>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="plant_visit">Plant Visit Details</TabsTrigger>
                                <TabsTrigger value="other_details">Other Details</TabsTrigger>
                            </TabsList>
                            <TabsContent value="plant_visit">
                                <PlantVisitDetailsTab />
                            </TabsContent>
                             <TabsContent value="other_details">
                                <OtherDetailsTab />
                            </TabsContent>
                        </Tabs>

                         <div className="flex justify-end gap-4 mt-8">
                             <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                             <Button type="button" variant="outline" onClick={() => setIsEmailModalOpen(true)}>
                                <Mail className="mr-2 h-4 w-4" /> Email to Client
                             </Button>
                            {activeTab === 'plant_visit' ? (
                                <Button type="button" onClick={form.handleSubmit(handleSaveAndContinue)}>
                                    <Save className="mr-2 h-4 w-4" /> Save & Continue
                                </Button>
                            ) : (
                                 <Button type="button" onClick={() => toast({title: "Placeholder", description: "Final save logic to be implemented."})}>
                                     <Save className="mr-2 h-4 w-4" /> Save
                                 </Button>
                            )}
                        </div>
                    </form>
                )}
                 <WaiverRequestModal
                    isOpen={isWaiverModalOpen}
                    onClose={() => setIsWaiverModalOpen(false)}
                    onSubmit={handleWaiverSubmit}
                 />

                 {selectedCompany && (
                     <SiteVisitEmailModal
                        isOpen={isEmailModalOpen}
                        onClose={() => setIsEmailModalOpen(false)}
                        visitData={formData}
                        company={selectedCompany}
                     />
                 )}
            </div>
        </FormProvider>
    );
}
