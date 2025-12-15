'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { PlusCircle, Trash2 } from 'lucide-react';

// Helper to generate a single field schema for Zod
const generateZodField = (prop: any) => {
  let fieldSchema: z.ZodTypeAny;

  switch (prop.type) {
    case 'string':
      fieldSchema = z.string();
      if (prop.format === 'email') {
        fieldSchema = fieldSchema.email({ message: "Invalid email address." });
      }
      if (prop.format === 'uri') {
          fieldSchema = fieldSchema.url({ message: "Invalid URL." });
      }
      // Allow empty strings
      fieldSchema = fieldSchema.optional().or(z.literal(''));
      break;
    case 'number':
      // Preprocess converts empty string or null/undefined to undefined, making it optional.
      // Otherwise, it parses the value to a float.
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
}

export function JsonSchemaForm({ schema, onSubmit, onCancel, requestId, dataKey }: JsonSchemaFormProps) {
  const firestore = useFirestore();
  const zodSchema = useMemo(() => generateZodSchema(schema), [schema]);
  
  const operationalInputRef = useMemoFirebase(() => {
      if (!firestore || !requestId) return null;
      return doc(firestore, 'operational_input', requestId);
  }, [firestore, requestId]);
  
  const { data: existingData, isLoading } = useDoc(operationalInputRef);

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (existingData && existingData[dataKey]) {
      form.reset(existingData[dataKey]);
    } else {
      // Initialize form with default values based on schema
      const defaultValues: {[key: string]: any} = {};
      Object.keys(schema.properties).forEach(sectionKey => {
        const sectionProp = schema.properties[sectionKey];
        if (sectionProp.type === 'object') {
          defaultValues[sectionKey] = {};
        } else if (sectionProp.type === 'array') {
          defaultValues[sectionKey] = [];
        }
      });
      form.reset(defaultValues);
    }
  }, [existingData, form, dataKey, schema]);

  const renderField = (name: string, prop: any, control: any) => {
    const { title, type, format } = prop;
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

  const renderTableSection = (sectionKey: string, sectionProp: any) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: sectionKey,
    });

    const itemProperties = sectionProp.items.properties;
    const headers = Object.keys(itemProperties);

    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(header => <TableHead key={header}>{itemProperties[header].title}</TableHead>)}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((item, index) => (
              <TableRow key={item.id}>
                {headers.map(header => (
                  <TableCell key={`${item.id}-${header}`}>
                    <FormField
                      control={form.control}
                      name={`${sectionKey}.${index}.${header}` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder={itemProperties[header].title} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const newRow: Record<string, any> = {};
            headers.forEach(header => newRow[header] = '');
            append(newRow);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Row
        </Button>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
        <CardDescription>{schema.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="multiple" defaultValue={sectionKeys} className="w-full">
              {sectionKeys.map(sectionKey => {
                const sectionProp = schema.properties[sectionKey];
                return(
                  <AccordionItem value={sectionKey} key={sectionKey}>
                    <AccordionTrigger>{sectionProp.title}</AccordionTrigger>
                    <AccordionContent className="p-4">
                      {sectionProp.type === 'object' && (
                        <div className="grid md:grid-cols-2 gap-8">
                          {Object.keys(sectionProp.properties).map(fieldKey => 
                            renderField(`${sectionKey}.${fieldKey}`, sectionProp.properties[fieldKey], form.control)
                          )}
                        </div>
                      )}
                      {sectionProp.type === 'array' && (
                        renderTableSection(sectionKey, sectionProp)
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
