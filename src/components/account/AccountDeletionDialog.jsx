import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AccountDeletionDialog() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) {
      toast.error('Please confirm account deletion');
      return;
    }

    setLoading(true);
    try {
      // Call backend function to delete account
      await base44.functions.invoke('deleteAccount', {});
      toast.success('Account deleted successfully');
      // Logout after deletion
      base44.auth.logout('/');
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="select-none w-full bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Delete Account?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 py-4">
            <p>
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </p>
            <div className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-900">You will lose:</p>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>All campaign data and history</li>
                <li>Wallet balance (non-refundable)</li>
                <li>Account settings and preferences</li>
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="confirm-delete"
                checked={confirmed}
                onCheckedChange={setConfirmed}
              />
              <Label 
                htmlFor="confirm-delete" 
                className="text-sm text-slate-700 cursor-pointer select-none"
              >
                I understand and want to delete my account
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel className="select-none">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!confirmed || loading}
            className="select-none bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}