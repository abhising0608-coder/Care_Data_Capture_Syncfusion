'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Trash2, Pencil, RefreshCw, Check, X } from "lucide-react";
import { useState } from 'react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";
import type { SiteVisitPersonnel } from '@/lib/definitions';
import { mockUsers } from '@/lib/mock-data';

export function PlantVisitDetailsTab() {
    const { control } = useFormContext();
    const careTeamMembers = Object.values(mockUsers).map(u => u.displayName || u.email);

    const { fields, append, remove, update } = useFieldArray({ control, name: "clientPersonnel" });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newPersonnel, setNewPersonnel] = useState<Partial<SiteVisitPersonnel>>({});

    const handleSavePersonnel = () => {
        if (!newPersonnel.name || !newPersonnel.designation) return;
        if (editingIndex !== null) {
            update(editingIndex, { ...fields[editingIndex], ...newPersonnel });
        } else {
            append({ id: uuidv4(), ...newPersonnel });
        }
        setNewPersonnel({});
        setEditingIndex(null);
    };
    
    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField name="visitDate" control={control} render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of Plant Visit *</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="careTeam" control={control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>CARE Team *</FormLabel>
                             <Select onValueChange={val => field.onChange([...(field.value || []), val])} >
                                <FormControl><SelectTrigger><SelectValue placeholder="Select team members" /></SelectTrigger></FormControl>
                                <SelectContent>{careTeamMembers.map((name, i) => <SelectItem key={i} value={name!}>{name}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {field.value?.map(member => <span key={member} className="bg-muted px-2 py-1 text-sm rounded-md">{member}</span>)}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField name="plantVisited" control={control} render={({ field }) => (<FormItem><FormLabel>Plant Visited *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="location" control={control} render={({ field }) => (
                        <FormItem>
                             <FormLabel>Location of the Plant *
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="ml-2 text-muted-foreground">(?)</span></TooltipTrigger>
                                        <TooltipContent><p>Comment on any specific advantages/disadvantages (e.g. proximity to raw material, land availability constraints, etc.)</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                             </FormLabel>
                             <FormControl><Input {...field} /></FormControl><FormMessage />
                        </FormItem>
                    )} />
                 </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Client Personnel Interacted *</CardTitle>
                        <CardDescription>Add the personnel who were present during the visit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader>
                             <TableBody>
                                {fields.map((field, index) => (
                                    editingIndex === index ? (
                                        <TableRow key={field.id}>
                                            <TableCell><Input value={newPersonnel.name || ''} onChange={e => setNewPersonnel(p => ({...p, name: e.target.value}))} /></TableCell>
                                            <TableCell><Input value={newPersonnel.designation || ''} onChange={e => setNewPersonnel(p => ({...p, designation: e.target.value}))} /></TableCell>
                                            <TableCell className="flex gap-1">
                                                <Button size="icon" variant="ghost" onClick={handleSavePersonnel}><Check className="h-4 w-4 text-green-500" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => { setEditingIndex(null); setNewPersonnel({}); }}><X className="h-4 w-4 text-red-500" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow key={field.id}>
                                            <TableCell>{(field as any).name}</TableCell>
                                            <TableCell>{(field as any).designation}</TableCell>
                                            <TableCell className="flex gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => { setEditingIndex(index); setNewPersonnel(field as any); }}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                ))}
                                {editingIndex === null && (
                                    <TableRow>
                                        <TableCell><Input placeholder="Personnel Name" value={newPersonnel.name || ''} onChange={e => setNewPersonnel(p => ({...p, name: e.target.value}))} /></TableCell>
                                        <TableCell><Input placeholder="Designation" value={newPersonnel.designation || ''} onChange={e => setNewPersonnel(p => ({...p, designation: e.target.value}))} /></TableCell>
                                        <TableCell className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={handleSavePersonnel}><Check className="h-4 w-4 text-green-500" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => setNewPersonnel({})}><RefreshCw className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                             </TableBody>
                        </Table>
                         <FormField name="clientPersonnel" control={control} render={({ fieldState }) => <FormMessage>{fieldState.error?.message}</FormMessage>} />
                    </CardContent>
                 </Card>
            </CardContent>
        </Card>
    );
}
