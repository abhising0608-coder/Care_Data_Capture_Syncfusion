'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const withdrawalSchema = z.object({
  reason: z.string().min(1, 'Withdrawal reason is required.'),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export function WithdrawalModal({ isOpen, onClose, onSubmit }: WithdrawalModalProps) {
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const handleFormSubmit = (data: WithdrawalFormValues) => {
    onSubmit(data.reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Request</DialogTitle>
           <DialogDescription>Provide a reason for withdrawing this request.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <Label htmlFor="reason">Reason for Withdrawal</Label>
            <Textarea
              id="reason"
              placeholder="Enter withdrawal reason here..."
              className="min-h-[120px]"
              {...register('reason')}
            />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    