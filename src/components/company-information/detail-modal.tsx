'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DetailItem } from '@/lib/definitions';
import { useEffect, useMemo } from 'react';
import type { ColumnDefinition } from './detail-block';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DetailItem) => void;
    columns: ColumnDefinition[];
    defaultValues?: DetailItem;
    title: string;
}

export function DetailModal({ isOpen, onClose, onSave, columns, defaultValues, title }: DetailModalProps) {
    
    const validationSchema = useMemo(() => {
        const schemaShape: any = {};
        columns.forEach(col => {
            let fieldSchema;
            switch(col.type) {
                case 'text':
                    fieldSchema = z.string();
                    if (col.accessor.toLowerCase().includes('email')) {
                        fieldSchema = fieldSchema.email({ message: "Invalid email format." }).or(z.literal(''));
                    }
                    if (col.required) {
                        fieldSchema = fieldSchema.min(1, `${col.header} is required.`);
                    } else {
                        fieldSchema = fieldSchema.optional().or(z.literal(''));
                    }
                    break;
                case 'number':
                    fieldSchema = z.number().optional();
                    break;
                case 'select':
                     if (col.options?.every(o => ['Yes', 'No'].includes(o))) {
                        // Handle boolean-like 'Yes'/'No' dropdowns
                        fieldSchema = z.preprocess(
                            val => val === 'Yes' ? true : (val === 'No' ? false : undefined),
                            z.boolean().optional()
                        );
                    } else {
                        fieldSchema = z.string();
                         if (col.required) {
                            fieldSchema = fieldSchema.min(1, `${col.header} is required.`);
                        } else {
                             fieldSchema = fieldSchema.optional();
                        }
                    }
                    
                    break;
                case 'boolean':
                    fieldSchema = z.boolean().optional();
                    break;
                default:
                    fieldSchema = z.any().optional();
            }
             schemaShape[col.accessor] = fieldSchema;
        });
        return z.object(schemaShape);
    }, [columns]);
    
    const form = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: defaultValues,
    });

     useEffect(() => {
        if (isOpen) {
            const transformedDefaults: any = { ...defaultValues };
            columns.forEach(col => {
                if (col.type === 'select' && col.options?.every(o => ['Yes', 'No'].includes(o))) {
                    const key = col.accessor as keyof typeof defaultValues;
                    if (defaultValues && typeof defaultValues[key] === 'boolean') {
                        transformedDefaults[key] = defaultValues[key] ? 'Yes' : 'No';
                    }
                }
            });
            form.reset(transformedDefaults || {});
        }
    }, [isOpen, defaultValues, form, columns]);

    const getModalTitle = () => {
        if (title.startsWith('Edit')) {
            return `Edit ${title.substring(5)}`;
        }
        return `Add New ${title}`;
    }

    const handleFormSubmit = (data: any) => {
        onSave(data as DetailItem);
    };
    
    const renderInput = (col: ColumnDefinition, field: any) => {
        switch (col.type) {
            case 'select':
                 return (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${col.header}`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {col.options?.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 );
            case 'number':
                 return (
                     <Input
                        {...field}
                        type="number"
                        placeholder={`Enter ${col.header}`}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                    />
                );
            case 'text':
            default:
                return (
                     <Input
                        {...field}
                        placeholder={`Enter ${col.header}`}
                        type={col.type === 'text' ? 'text' : col.type}
                    />
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{getModalTitle()}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                         <div className="grid border-t border-x">
                            {columns.map(col => (
                               <FormField
                                    key={col.accessor}
                                    control={form.control}
                                    name={col.accessor}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-3 items-start border-b">
                                            <div className="px-4 py-2 bg-muted/50 h-full flex items-center border-r">
                                               <label className="text-sm font-medium">{col.header}{col.required && <span className="text-destructive">*</span>}</label>
                                            </div>
                                            <div className="col-span-2 p-2">
                                               <FormControl>
                                                  {renderInput(col, field)}
                                               </FormControl>
                                               <FormMessage className="mt-1" />
                                            </div>
                                        </div>
                                    )}
                                />
                            ))}
                        </div>
                        <DialogFooter className="pt-6">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
