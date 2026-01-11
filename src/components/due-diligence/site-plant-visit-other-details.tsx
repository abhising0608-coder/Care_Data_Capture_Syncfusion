'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const TooltipLabel = ({ label, tooltipText, required = false }: { label: string, tooltipText: string, required?: boolean }) => (
    <div className="flex items-center gap-1.5">
        <FormLabel>{label}{required && <span className="text-destructive">*</span>}</FormLabel>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
);


export function SitePlantVisitOtherDetails() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* About Plant Column */}
        <div className="space-y-4 border-r pr-8">
            <h3 className="font-semibold text-lg border-b pb-2">About Plant</h3>
            <FormField
                control={control}
                name="operationalStatus"
                render={({ field }) => (
                    <FormItem>
                         <TooltipLabel label="Operational status of the plant" tooltipText="Is the plant fully operational, partially operational, or under construction?" />
                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="operational">Operational</SelectItem><SelectItem value="partial">Partially Operational</SelectItem><SelectItem value="under-construction">Under Construction</SelectItem></SelectContent></Select>
                    </FormItem>
                )}
            />
             <FormField control={control} name="deptProcesses" render={({ field }) => (<FormItem><TooltipLabel label="Explain in brief about the various dept, processes carried out etc." tooltipText="Describe the main departments and production processes." /><Textarea {...field} /></FormItem>)}/>
             <FormField control={control} name="productsManufactured" render={({ field }) => (<FormItem><TooltipLabel label="Products manufactured at the plant and installed capacity at that plant" tooltipText="List the key products and their annual production capacity." required /><Textarea {...field} /></FormItem>)}/>
             <FormField control={control} name="capexCompleted" render={({ field }) => (<FormItem><TooltipLabel label="In case the company has implemented a capex programme, please check whether it has been completed and facilities are operational" tooltipText="Confirm if any recent capital expenditure programs are finished and operational." /><Textarea {...field} /></FormItem>)}/>
             <FormField control={control} name="technologyAdopted" render={({ field }) => (<FormItem><TooltipLabel label="Technology adopted" tooltipText="Describe the key technologies used in the plant." /><Textarea {...field} /></FormItem>)}/>
             <FormField control={control} name="accreditations" render={({ field }) => (<FormItem><TooltipLabel label="Accreditation certifications, if any" tooltipText="List any ISO, GMP, or other relevant certifications." /><Textarea {...field} /></FormItem>)}/>
             <FormField control={control} name="rawMaterialStorage" render={({ field }) => (<FormItem><TooltipLabel label="Adequacy of raw material storage facility" tooltipText="Assess if the storage for raw materials is sufficient for operations." /><Textarea {...field} /></FormItem>)}/>
             <FormField control={control} name="rawMaterialDuration" render={({ field }) => (<FormItem><TooltipLabel label="Duration of raw material storage" tooltipText="How long can raw materials be stored on-site?" /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="finishedGoodsStorage" render={({ field }) => (<FormItem><TooltipLabel label="Adequacy of finished goods storage facility" tooltipText="Assess if the storage for finished products is sufficient." /><Textarea {...field} /></FormItem>)}/>
        </div>
        {/* Capex & Labour Column */}
        <div className="space-y-4">
             <h3 className="font-semibold text-lg border-b pb-2">Capex</h3>
             <FormField control={control} name="landAcquired" render={({ field }) => (<FormItem><TooltipLabel label="Availability of land if acquired" tooltipText="Is there extra land available for future expansion?" /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="epcContractor" render={({ field }) => (<FormItem><TooltipLabel label="Details of EPC contractor, if any" tooltipText="Name and details of the Engineering, Procurement, and Construction contractor." /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="civilWorkStatus" render={({ field }) => (<FormItem><TooltipLabel label="Status of civil work" tooltipText="Current status of building and infrastructure construction." /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="civilWorkContractor" render={({ field }) => (<FormItem><TooltipLabel label="Details of Civil work contractor" tooltipText="Name and details of the civil works contractor." /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="plantMachineryDetails" render={({ field }) => (<FormItem><TooltipLabel label="Details on plant and machinery" tooltipText="Information on key machinery, suppliers, and installation status." /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="approvalsStatus" render={({ field }) => (<FormItem><TooltipLabel label="Status of approvals, especially the critical ones" tooltipText="Update on environmental, construction, and other necessary permits." /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="capexImplementationStatus" render={({ field }) => (<FormItem><TooltipLabel label="Overall status of capex implementation" tooltipText="A summary of the progress of the capital expenditure project." /><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="completionDate" render={({ field }) => (<FormItem><TooltipLabel label="Scheduled date of completion and likely date of completion" tooltipText="Original and expected completion dates for the project." /><Input {...field} /></FormItem>)}/>

             <h3 className="font-semibold text-lg border-b pb-2 pt-4">Labour</h3>
             <FormField control={control} name="labourRelations" render={({ field }) => (<FormItem><FormLabel>Relationship with labour</FormLabel><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="labourUnion" render={({ field }) => (<FormItem><FormLabel>Labour union, if any</FormLabel><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="workforceStrength" render={({ field }) => (<FormItem><FormLabel>Total strength of workforce</FormLabel><Input {...field} /></FormItem>)}/>
             <FormField control={control} name="esicPfCompliance" render={({ field }) => (<FormItem><FormLabel>Compliance with ESIC/PF requirements</FormLabel><Input {...field} /></FormItem>)}/>
        </div>
        <div className="md:col-span-2 space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Any Other Information</h3>
            <FormField control={control} name="anyOtherInfo" render={({ field }) => (<FormItem><Textarea {...field} placeholder="Enter any other relevant details..." required /></FormItem>)}/>
        </div>
      </CardContent>
    </Card>
  );
}
