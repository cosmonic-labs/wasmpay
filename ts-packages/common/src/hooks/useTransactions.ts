import React from 'react';
import type {CreateTransaction, Transaction} from '#services/backend/api/transactions.ts';
import type {Bank} from '#services/backend/api/banks.ts';
import {useApi} from '#services/backend/hooks/useApi.ts';

export function useTransactions() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const api = useApi();

  React.useEffect(() => {
    async function getTransactions() {
      if (isLoading) {
        let transactionsResponse = await api.transactions();
        let data = transactionsResponse.data ?? [];
        setTransactions(data);
        setIsLoading(false);
      }
    }

    getTransactions();
  }, [isLoading]);

  const balance = React.useMemo(
    () =>
      transactions.reduce((total, t) => total + Math.round(parseFloat(t.amount) * 100), 0) / 100,
    [transactions],
  );

  const createTransaction = React.useCallback(
    async (origin: Bank | undefined, destination: Bank | undefined) => {
      if (!origin || !destination) {
        console.error('Bank not found');
        return;
      }

      const transaction: CreateTransaction = {
        currency: origin.currency,
        amount: 100,
        origin,
        destination,
        status: 'Pending',
        reason: '',
      };

      const transactionId: number = Math.random() * 1000000;
      const temporaryTransaction: Transaction = {
        ...transaction,
        id: transactionId,
        amount: transaction.amount.toString(),
        origin: transaction.origin.id,
        destination: transaction.destination.id,
      };

      setTransactions((prev) => [...prev, temporaryTransaction]);

      console.log('Creating transaction', transaction);

      const response = await api.createTransaction(transaction);
      console.log(`Transaction ${response.data.id} created successfully`);
      console.dir(JSON.stringify(response.data, null, 2));

      // setting loading to start the fetch again
      setIsLoading(true);
    },
    [],
  );

  return {transactions, balance, isLoading, createTransaction};
}
