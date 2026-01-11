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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { PlusCircle, Trash2, Check, RefreshCw, Pencil, X, ChevronsUp, ChevronsDown, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      const isRowEmpty = Object.values(newRow).every(val => val === '' || val === undefined || val === null);
      if (isRowEmpty) return;

      append({ srNo: fields.length + 1, ...newRow });
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

    const renderInputForCell = (item: Record<string, any>, header: string, isNewRow: boolean) => {
      const prop = itemProperties[header];
      const value = item[header] ?? '';

      const handleInputChange = (val: any) => {
          const updatedRow = isNewRow ? { ...newRow, [header]: val } : { ...(fields[editingIndex!] as object), [header]: val };
          
          if(isNewRow) {
            setNewRow(updatedRow);
          } else {
            setNewRow(updatedRow); // Also update newRow state when editing
          }
      };

      if (prop.enum) {
        return (
          <Select value={value} onValueChange={handleInputChange}>
            <SelectTrigger><SelectValue placeholder={prop.title} /></SelectTrigger>
            <SelectContent>
              {prop.enum.map((option: string) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      }
      
      if (prop['x-ui-readonly']) {
          return <Input placeholder={prop.title} value={(fields.length + 1).toString()} readOnly />;
      }

      return (
        <Input
          placeholder={prop.title}
          value={value}
          onChange={(e) => handleInputChange(prop.type === 'number' ? e.target.valueAsNumber || '' : e.target.value)}
          type={prop.type === 'number' ? 'number' : 'text'}
        />
      );
    };

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {headers.map(header => <TableHead key={header}>{itemProperties[header].title}</TableHead>)}
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* New/Editing Row */}
            {editingIndex === null && (
               <TableRow>
                {headers.map(header => (
                  <TableCell key={`new-${header}`}>
                    {renderInputForCell(newRow, header, true)}
                  </TableCell>
                ))}
                <TableCell className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleAddNew}><Check className="h-4 w-4 text-green-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setNewRow({})}><RefreshCw className="h-4 w-4 text-blue-500" /></Button>
                </TableCell>
              </TableRow>
            )}

            {/* Existing Rows */}
            {fields.map((item, index) => (
               editingIndex === index ? (
                 <TableRow key={item.id}>
                    {headers.map(header => (
                        <TableCell key={`${item.id}-edit-${header}`}>
                            {renderInputForCell(newRow, header, false)}
                        </TableCell>
                    ))}
                     <TableCell className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={handleUpdate}><Check className="h-4 w-4 text-green-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleCancelEdit}><X className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                 </TableRow>
               ) : (
                <TableRow key={item.id}>
                    {headers.map(header => (
                    <TableCell key={`${item.id}-${header}`}>
                        {(item as Record<string, any>)[header]}
                    </TableCell>
                    ))}
                    <TableCell className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </TableCell>
                </TableRow>
               )
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
 const renderSectionContent = (sectionKey: string, sectionProp: any) => {
    const uiVariant = sectionProp['x-ui-variant'];

    // For sections that are simple objects with properties (like basicDetails)
    if (sectionProp.properties && !uiVariant) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4">
                {Object.keys(sectionProp.properties).map(fieldKey => 
                    renderField(`${sectionKey}.${fieldKey}`, sectionProp.properties[fieldKey], form.control)
                )}
            </div>
        );
    }
    
    // For sections that are arrays of objects (like boardOfDirectors)
    if (sectionProp.type === 'array' && sectionProp.items?.type === 'object' && uiVariant !== 'accordion') {
         return renderInlineEditableTable({
            sectionKey,
            itemProperties: sectionProp.items.properties,
            control: form.control,
        });
    }

    if (uiVariant === 'accordion') {
      const sectionProperties = sectionProp.properties;
      if (sectionProperties && sectionProp.properties.dataAvailability) {
        return (
          <>
            <div className="w-1/3 p-4">
              <FormField
                control={form.control}
                name={`${sectionKey}.dataAvailability`}
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
            <Controller
              control={form.control}
              name={`${sectionKey}`}
              render={({ field }) => {
                if (field.value?.dataAvailability !== 'Available') return null;

                const subSections = Object.keys(sectionProperties).filter(key => key !== 'dataAvailability');
                
                return (
                  <Accordion type="multiple" className="w-full">
                    {subSections.map(subSectionKey => {
                      const subSectionProp = sectionProperties[subSectionKey];
                      return (
                        <AccordionItem value={subSectionKey} key={subSectionKey}>
                          <AccordionTrigger>{subSectionProp.title}</AccordionTrigger>
                          <AccordionContent>
                             <div className="space-y-4 p-4">
                              {renderInlineEditableTable({
                                sectionKey: `${sectionKey}.${subSectionKey}`,
                                itemProperties: subSectionProp.items.properties,
                                control: form.control,
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                )
              }}
            />
          </>
        )
      } else {
        return (
            <Accordion type="multiple" className="w-full">
                {Object.keys(sectionProp.properties).map(subSectionKey => {
                    const subSectionProp = sectionProp.properties[subSectionKey];
                    const subSectionUiVariant = subSectionProp['x-ui-variant'];

                    return (
                        <AccordionItem value={subSectionKey} key={subSectionKey}>
                            <AccordionTrigger>{subSectionProp.title}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 p-4">
                                  {subSectionUiVariant === 'spreadsheet' && subSectionProp.properties?.dataAvailability ? (
                                    <>
                                       <div className="w-1/3">
                                          <FormField
                                            control={form.control}
                                            name={`${sectionKey}.${subSectionKey}.dataAvailability`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>{subSectionProp.properties.dataAvailability.title}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select availability" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    {subSectionProp.properties.dataAvailability.enum.map((option: string) => (
                                                      <SelectItem key={option} value={option}>{option}</SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                       <Controller
                                          control={form.control}
                                          name={`${sectionKey}.${subSectionKey}`}
                                          render={({ field }) => {
                                            if (field.value?.dataAvailability !== 'Available') return null;

                                            const handleSave = (newData: any) => {
                                                const currentVal = field.value || { versions: [], activeVersion: 0 };
                                                const newVersionNumber = currentVal.versions.length > 0 ? Math.max(...currentVal.versions.map((v: any) => v.version)) + 1 : 1;
                                                const newVersion = {
                                                    version: newVersionNumber,
                                                    timestamp: new Date().toISOString(),
                                                    data: newData,
                                                };
                                                const newVersions = [...currentVal.versions, newVersion];
                                                field.onChange({ ...currentVal, versions: newVersions, activeVersion: newVersionNumber });
                                            };
                                            const handleRollback = (versionNumber: number) => {
                                                field.onChange({ ...field.value, activeVersion: versionNumber });
                                            };

                                            const spreadsheetType = subSectionProp['x-ui-spreadsheet-type'];
                                            switch (spreadsheetType) {
                                              case 'geography-sales':
                                                return <GeographyWiseSalesSpreadsheet data={field.value} onSave={handleSave} onRollback={handleRollback} />;
                                              case 'simple-table':
                                              default:
                                                return <SyncfusionSpreadsheet data={field.value} onSave={handleSave} onRollback={handleRollback} />;
                                            }
                                          }}
                                        />
                                    </>
                                  ) : subSectionProp.type === 'array' && subSectionProp.items?.type === 'object' ? (
                                    renderInlineEditableTable({
                                        sectionKey: `${sectionKey}.${subSectionKey}`,
                                        itemProperties: subSectionProp.items.properties,
                                        control: form.control,
                                    })
                                  ) : null}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        );
      }
    }
    
    return null; // Should not happen if schema is well-formed
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
  const [activeTab, setActiveTab] = useState(sectionKeys[0] || '');

  return (
    <Card>
      <CardHeader>
          <div>
              <CardTitle>{schema.title}</CardTitle>
              <CardDescription>{schema.description}</CardDescription>
          </div>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  {sectionKeys.map(sectionKey => (
                    <TabsTrigger key={sectionKey} value={sectionKey}>
                        {schema.properties[sectionKey].title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {sectionKeys.map(sectionKey => {
                    const sectionProp = schema.properties[sectionKey];
                    return (
                        <TabsContent key={sectionKey} value={sectionKey} className="mt-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle>{sectionProp.title}</CardTitle>
                                    {sectionProp.description && <CardDescription>{sectionProp.description}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    {renderSectionContent(sectionKey, sectionProp)}
                                     {sectionKey === 'otherDetails' && (
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold mb-4">Import Data from Other Sectors</h3>
                                            <div className="p-4 border rounded-lg space-y-4">
                                                <div className="flex gap-4 items-end">
                                                     <div className="flex-1">
                                                        <Label>Select Sector</Label>
                                                        <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="auto">Auto</SelectItem><SelectItem value="infra">Infra</SelectItem></SelectContent></Select>
                                                     </div>
                                                     <div className="flex-1">
                                                        <Label>Select Headings</Label>
                                                        <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="h1">Heading 1</SelectItem></SelectContent></Select>
                                                     </div>
                                                     <Button type="button">Continue</Button>
                                                </div>
                                            </div>
                                            {submitButtonText && (
                                                <div className="flex justify-end gap-4 mt-8">
                                                    <Button type="submit">
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {submitButtonText}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                })}
             </Tabs>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
