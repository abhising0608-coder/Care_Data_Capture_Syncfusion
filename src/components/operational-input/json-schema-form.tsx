'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

// Helper function to generate Zod schema from JSON schema
const generateZodSchema = (schema: any) => {
  const zodSchema: any = {};
  for (const key in schema.properties) {
    const prop = schema.properties[key];
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
        // All fields are optional as per requirement
        fieldSchema = fieldSchema.optional().or(z.literal(''));
        break;
      case 'number':
        // For numbers, we accept a string and transform it, or just a number
        fieldSchema = z.preprocess(
          (a) => (a === '' || a === undefined || a === null) ? undefined : (typeof a === 'string' ? parseFloat(a) : a),
          z.number().optional()
        );
        break;
      case 'boolean':
        fieldSchema = z.boolean().optional();
        break;
      default:
        fieldSchema = z.any().optional();
        break;
    }
    zodSchema[key] = fieldSchema;
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
      const defaultValues: {[key: string]: any} = {};
      Object.keys(schema.properties).forEach(key => {
        defaultValues[key] = '';
      });
      form.reset(defaultValues);
    }
  }, [existingData, form, dataKey, schema.properties]);

  const renderField = (key: string, prop: any) => {
    const { title, type, format } = prop;
    let inputType = 'text';
    if (type === 'number') inputType = 'number';
    if (format === 'email') inputType = 'email';
    if (format === 'uri') inputType = 'url';
    
    return (
      <FormField
        key={key}
        control={form.control}
        name={key}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title || key}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type={inputType}
                placeholder={`Enter ${title || key}`}
                // Ensure value is a string for the input component
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };
  
  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                      {Object.keys(schema.properties).map(key => (
                          <div key={key} className="space-y-2">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                      ))}
                  </div>
                   <div className="flex justify-end gap-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                   </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
        <CardDescription>{schema.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {Object.keys(schema.properties).map((key) =>
                renderField(key, schema.properties[key])
              )}
            </div>
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
