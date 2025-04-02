import {TransactionFormContext} from '@/features/transactions/context/transaction-form-context';
import React from 'react';

export function useTransactionForm() {
  const context = React.useContext(TransactionFormContext);
  if (!context) {
    throw new Error('useTransactionForm must be used within a TransactionFormProvider');
  }
  return context;
}
