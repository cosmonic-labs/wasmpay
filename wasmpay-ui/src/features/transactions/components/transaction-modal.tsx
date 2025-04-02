import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useTransactionForm} from '@/features/transactions/context/use-transaction-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useTransactions} from '@repo/common/hooks/useTransactions';
import React from 'react';
import {Loader2Icon} from 'lucide-react';
import {toast} from 'sonner';

export function TransactionModal({reloadTransactions}: {reloadTransactions: () => void}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {createTransaction} = useTransactions();
  const {isOpen, closeForm, mode, form, updateForm, banks} = useTransactionForm();

  const isRequest = mode === 'request';

  const handleTransaction = () => {
    const origin = banks.all.find((bank) => bank.id === form.origin);
    const destination = banks.all.find((bank) => bank.id === form.destination);
    setIsSubmitting(true);
    setError(null);
    toast.loading('Processing transaction...');
    console.dir(form);
    createTransaction(origin, destination, form.amount || 0, false)
      .then(() => {
        setIsSubmitting(false);
        reloadTransactions();
        toast.dismiss();
        toast.success('Transaction completed successfully!');
        closeForm();
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.dismiss();
        toast.error('Transaction failed. Please try again.');
        setError(error.response.message);
        console.dir(error);
        console.error('Transaction failed:', error);
      });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
      setIsSubmitting(false);
      closeForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isRequest ? 'Request Money' : 'Send Money'}</DialogTitle>
          <DialogDescription>
            {isRequest
              ? 'Get paid by someone into your WasmPay account'
              : 'Pay someone with your WasmPay account'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isRequest ? (
            <div className="space-y-2">
              <Label htmlFor="request-recipient">From</Label>
              <Select value={form.origin} onValueChange={(value) => updateForm('origin', value)}>
                <SelectTrigger className="w-full mb-0">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.filtered.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="send-recipient">To</Label>
              <Select
                value={form.destination}
                onValueChange={(value) => updateForm('destination', value)}
              >
                <SelectTrigger className="w-full mb-0">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.filtered.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="request-amount">Amount</Label>
            <Input
              id="request-amount"
              value={form.amount}
              onChange={(e) => updateForm('amount', parseFloat(e.target.value))}
              placeholder="Enter amount"
              type="number"
              min="0.01"
              step="0.01"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button onClick={handleTransaction}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                <span className="ml-2">Processing...</span>
              </>
            ) : isRequest ? (
              'Request'
            ) : (
              'Send'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
