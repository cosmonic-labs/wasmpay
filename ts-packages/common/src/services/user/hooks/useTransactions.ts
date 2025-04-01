import type {Transaction} from '#services/backend/api/transactions.ts';
import {useApi} from '#services/backend/hooks/useApi.ts';
import React from 'react';

export function useTransactions() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const api = useApi();

  React.useEffect(() => {
    console.log('effect reloaded');
    async function getTransactions() {
      console.log('getting');
      if (isLoading) {
        console.log('is loading');
        let transactionsResponse = await api.transactions();
        let data = transactionsResponse.data ?? [];
        setTransactions(data);
        setIsLoading(false);
        console.log('done');
      }
    }

    getTransactions();
  }, [isLoading]);

  const balance = React.useMemo(
    () =>
      transactions.reduce((total, t) => total + Math.round(parseFloat(t.amount) * 100), 0) / 100,
    [transactions],
  );

  return {transactions, balance, isLoading, setIsLoading};
}
