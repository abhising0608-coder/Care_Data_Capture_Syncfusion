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

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comments: string) => void;
}

const rejectionSchema = z.object({
  comments: z.string().min(1, 'Rejection comments are required.'),
});

type RejectionFormValues = z.infer<typeof rejectionSchema>;

export function RejectionModal({ isOpen, onClose, onSubmit }: RejectionModalProps) {
  const form = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const handleFormSubmit = (data: RejectionFormValues) => {
    onSubmit(data.comments);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Request</DialogTitle>
          <DialogDescription>
            Please provide comments for rejecting this request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <Label htmlFor="comments">Rejection Comments</Label>
            <Textarea
              id="comments"
              placeholder="Enter rejection comments here..."
              className="min-h-[120px]"
              {...register('comments')}
            />
            {errors.comments && <p className="text-sm text-destructive">{errors.comments.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" /> Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
