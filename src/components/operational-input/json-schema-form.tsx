
'use client';

import { useForm, useFieldArray, Controller, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { PlusCircle, Trash2, Check, RefreshCw, Pencil, X, ChevronsUp, ChevronsDown, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SyncfusionSpreadsheet } from './syncfusion-spreadsheet';
import { GeographyWiseSalesSpreadsheet } from './geography-wise-sales-spreadsheet';

// Helper to generate a single field schema for Zod
const generateZodField = (prop: any): z.ZodTypeAny => {
  let fieldSchema: z.ZodTypeAny;

  switch (prop.type) {
    case 'string':
      fieldSchema = z.string();
      if (prop.format === 'email') fieldSchema = fieldSchema.email({ message: "Invalid email address." });
      if (prop.format === 'uri') fieldSchema = fieldSchema.url({ message: "Invalid URL." });
      if (prop.enum) fieldSchema = z.enum(prop.enum as [string, ...string[]]);
      fieldSchema = fieldSchema.optional().or(z.literal(''));
      break;
    case 'number':
      fieldSchema = z.preprocess(
        (a) => {
            if (a === '' || a === null || a === undefined) return undefined;
            const num = parseFloat(String(a));
            return isNaN(num) ? undefined : num;
        },
        z.number().optional()
      );
      break;
    case 'boolean':
      fieldSchema = z.boolean().optional();
      break;
    case 'array':
      if (prop.items && prop.items.type === 'object') {
        const itemSchema = generateZodSchema(prop.items);
        fieldSchema = z.array(itemSchema).optional();
      } else {
        fieldSchema = z.any().optional();
      }
      break;
    case 'object':
      fieldSchema = generateZodSchema(prop).optional();
      break;
    default:
      fieldSchema = z.any().optional();
      break;
  }
  return fieldSchema;
};

// Recursive helper to generate Zod schema from JSON schema
const generateZodSchema = (schema: any): z.ZodObject<any> => {
  const zodSchema: any = {};
  if (schema.properties) {
    for (const key in schema.properties) {
      const prop = schema.properties[key];
      zodSchema[key] = generateZodField(prop);
    }
  }
  return z.object(zodSchema);
};

interface JsonSchemaFormProps {
  schema: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  requestId: string;
  dataKey: string;
  isLastStep?: boolean;
  submitButtonText?: string;
  formInstance?: any; // Pass react-hook-form instance
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function JsonSchemaForm({ schema, onSubmit, onCancel, requestId, dataKey, isLastStep = false, submitButtonText, formInstance }: JsonSchemaFormProps) {
  const zodSchema = useMemo(() => generateZodSchema(schema), [schema]);
  
  const { data: existingData, isLoading } = useSWR(`/api/operational-input/${requestId}`, fetcher);

  const localForm = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  const form = formInstance || localForm;

  useEffect(() => {
    if (existingData && existingData[dataKey]) {
      form.reset(existingData[dataKey]);
    } else {
      const defaultValues: {[key: string]: any} = {};
      if (schema.properties) {
        Object.keys(schema.properties).forEach(sectionKey => {
            const sectionProp = schema.properties[sectionKey];
            if (sectionProp.type === 'object') {
              const sectionDefaults: {[key: string]: any} = {};
               if (sectionProp.properties) {
                Object.keys(sectionProp.properties).forEach(fieldKey => {
                    const fieldProp = sectionProp.properties[fieldKey];
                    if (fieldProp.type === 'array') {
                        sectionDefaults[fieldKey] = [];
                    }
                     if (fieldKey === 'versions') {
                        sectionDefaults[fieldKey] = [];
                    }
                    if (fieldKey === 'activeVersion') {
                        sectionDefaults[fieldKey] = 1;
                    }
                    if (fieldProp.default) {
                      sectionDefaults[fieldKey] = fieldProp.default;
                    }
                });
               }
               defaultValues[sectionKey] = sectionDefaults;
            }
            else if (sectionProp.type === 'array') defaultValues[sectionKey] = [];
        });
      }
      form.reset(defaultValues);
    }
  }, [existingData, form, dataKey, schema]);

  const renderField = (name: string, prop: any, control: any) => {
    const { title, type, format, enum: options } = prop;
    
    if (options) {
      return (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{title || name}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder={`Select ${title || name}`} /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((option: string) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    let inputType = 'text';
    if (type === 'number') inputType = 'number';
    if (format === 'email') inputType = 'email';
    if (format === 'uri') inputType = 'url';
    
    return (
      <FormField
        key={name}
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title || name}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type={inputType}
                placeholder={`Enter ${title || name}`}
                value={field.value ?? ''}
                onChange={e => {
                  const val = type === 'number' ? e.target.valueAsNumber : e.target.value;
                  field.onChange(isNaN(val as number) ? '' : val);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };
  
  const renderInlineEditableTable = ({
    sectionKey,
    itemProperties,
    control,
  }: {
    sectionKey: string;
    itemProperties: any;
    control: any;
  }) => {
    const { fields, append, remove, update } = useFieldArray({ control, name: sectionKey });
    const headers = Object.keys(itemProperties);

    const [newRow, setNewRow] = useState<Record<string, any>>({});
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddNew = () => {
      append(newRow);
      setNewRow({});
    };

    const handleUpdate = () => {
      if (editingIndex === null) return;
      update(editingIndex, newRow);
      setNewRow({});
      setEditingIndex(null);
    };

    const handleEdit = (index: number) => {
      setEditingIndex(index);
      setNewRow(fields[index] as Record<string, any>);
    };

    const handleCancelEdit = () => {
      setEditingIndex(null);
      setNewRow({});
    };

    const renderInputForCell = (item: Record<string, any>, header: string) => {
      const prop = itemProperties[header];
      const value = item[header] ?? '';

      if (prop.enum) {
        return (
          <Select value={value} onValueChange={(val) => setNewRow(prev => ({ ...prev, [header]: val }))}>
            <SelectTrigger><SelectValue placeholder={prop.title} /></SelectTrigger>
            <SelectContent>
              {prop.enum.map((option: string) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      }

      return (
        <Input
          placeholder={prop.title}
          value={value}
          onChange={(e) => setNewRow(prev => ({ ...prev, [header]: e.target.value }))}
          type={prop.type === 'number' ? 'number' : 'text'}
        />
      );
    };

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(header => <TableHead key={header}>{itemProperties[header].title}</TableHead>)}
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* New/Editing Row */}
            <TableRow>
              {headers.map(header => (
                <TableCell key={`new-${header}`}>
                  {renderInputForCell(newRow, header)}
                </TableCell>
              ))}
              <TableCell className="flex items-center gap-1">
                {editingIndex !== null ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={handleUpdate}><Check className="h-4 w-4 text-green-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit}><X className="h-4 w-4 text-red-500" /></Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" onClick={handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setNewRow({})}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                  </>
                )}
              </TableCell>
            </TableRow>

            {/* Existing Rows */}
            {fields.map((item, index) => (
              <TableRow key={item.id}>
                {headers.map(header => (
                  <TableCell key={`${item.id}-${header}`}>
                    {(item as Record<string, any>)[header]}
                  </TableCell>
                ))}
                <TableCell className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(index)} disabled={editingIndex !== null}>
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={editingIndex !== null}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
 const AccordionSectionContent = ({ sectionKey, sectionProp }: { sectionKey: string, sectionProp: any }) => {
    
    // For sections that are simple objects with properties (like basicDetails)
    if (sectionProp.properties && !sectionProp['x-ui-variant']) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.keys(sectionProp.properties).map(fieldKey => 
                    renderField(`${sectionKey}.${fieldKey}`, sectionProp.properties[fieldKey], form.control)
                )}
            </div>
        );
    }
    
    // For sections that are arrays of objects (like boardOfDirectors)
    if (sectionProp.type === 'array' && sectionProp.items?.type === 'object') {
         return renderInlineEditableTable({
            sectionKey,
            itemProperties: sectionProp.items.properties,
            control: form.control,
        });
    }


    const dataAvailabilityPath = `${sectionKey}.dataAvailability`;
    const dataAvailability = useWatch({ control: form.control, name: dataAvailabilityPath });

    const uiVariant = sectionProp['x-ui-variant'];
    const spreadsheetType = sectionProp['x-ui-spreadsheet-type'];


    const renderContent = () => {
        if (dataAvailability !== 'Available') return null;

        if (uiVariant === 'spreadsheet') {
            const versionsPath = `${sectionKey}.versions`;
            const activeVersionPath = `${sectionKey}.activeVersion`;

            const handleSave = (newData: any[]) => {
                const currentVersions = form.getValues(versionsPath as any) || [];
                const newVersionNumber = currentVersions.length > 0 ? Math.max(...currentVersions.map((v: any) => v.version)) + 1 : 1;
                
                const newVersion = {
                    version: newVersionNumber,
                    timestamp: new Date().toISOString(),
                    data: newData,
                };
                
                form.setValue(versionsPath as any, [...currentVersions, newVersion]);
                form.setValue(activeVersionPath as any, newVersionNumber);
            };

            const handleRollback = (versionNumber: number) => {
                form.setValue(activeVersionPath as any, versionNumber);
            };

            const spreadsheetData = form.getValues(sectionKey as any);
            
            switch (spreadsheetType) {
              case 'geography-sales':
                return (
                  <GeographyWiseSalesSpreadsheet
                    data={spreadsheetData}
                    onSave={handleSave}
                    onRollback={handleRollback}
                  />
                );
              case 'simple-table':
              default:
                return (
                  <SyncfusionSpreadsheet
                    data={spreadsheetData}
                    onSave={handleSave}
                    onRollback={handleRollback}
                  />
                );
            }
        }

        if (sectionProp.properties.tableData) {
            return renderInlineEditableTable({
                sectionKey: `${sectionKey}.tableData`,
                itemProperties: sectionProp.properties.tableData.items.properties,
                control: form.control,
            });
        }
        
        return null;
    }

    return (
      <div className="space-y-4">
        <div className="w-1/3">
          <FormField
            control={form.control}
            name={dataAvailabilityPath}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{sectionProp.properties.dataAvailability.title}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectionProp.properties.dataAvailability.enum.map((option: string) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {renderContent()}
      </div>
    );
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
               <div className="flex justify-end gap-4 mt-8">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
               </div>
            </CardContent>
        </Card>
    )
  }
  
  const sectionKeys = Object.keys(schema.properties);
  const [openAccordions, setOpenAccordions] = useState<string[]>(sectionKeys);

  const toggleAll = (state: 'expand' | 'collapse') => {
    if (state === 'expand') {
      setOpenAccordions(sectionKeys);
    } else {
      setOpenAccordions([]);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>{schema.title}</CardTitle>
                <CardDescription>{schema.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => toggleAll('expand')}>
                    <ChevronsDown className="h-4 w-4 mr-2" /> Expand All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => toggleAll('collapse')}>
                    <ChevronsUp className="h-4 w-4 mr-2" /> Collapse All
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions} className="w-full">
              {sectionKeys.map(sectionKey => {
                const sectionProp = schema.properties[sectionKey];
                
                return(
                  <AccordionItem value={sectionKey} key={sectionKey}>
                    <AccordionTrigger>{sectionProp.title}</AccordionTrigger>
                    <AccordionContent className="p-4">
                      {sectionProp.type === 'object' ? (
                         <AccordionSectionContent sectionKey={sectionKey} sectionProp={sectionProp} />
                      ) : sectionProp.type === 'array' ? (
                        renderInlineEditableTable({
                          sectionKey: sectionKey,
                          itemProperties: sectionProp.items.properties,
                          control: form.control,
                        })
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
            {submitButtonText && (
               <div className="flex justify-end gap-4">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {submitButtonText}
                  </Button>
              </div>
            )}
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
