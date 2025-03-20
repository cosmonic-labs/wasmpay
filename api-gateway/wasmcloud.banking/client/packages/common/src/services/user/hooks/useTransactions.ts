import {useApi} from '#services/backend/hooks/useApi.ts';
import React from 'react';

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  account: string;
  status: 'Processing' | 'Complete' | 'In Progress' | 'Cancelled';
  method: 'Credit' | 'Check' | 'Transfer';
  date: number;
};

const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: "Victoria's Treats",
    amount: -52.14,
    account: 'xxx4565494',
    status: 'Processing',
    method: 'Credit',
    date: 1727323200,
  },
  {
    id: 2,
    description: 'Morgan Seis, LLC',
    amount: -428.47,
    account: 'xxx4565494',
    status: 'Complete',
    method: 'Credit',
    date: 1727150400,
  },
  {
    id: 7,
    description: 'Wallmart',
    amount: -143.19,
    account: 'xxx4565494',
    status: 'Complete',
    method: 'Check',
    date: 1727000600,
  },
  {
    id: 3,
    description: 'Wallmart',
    amount: -112.23,
    account: 'xxx4565494',
    status: 'In Progress',
    method: 'Check',
    date: 1726804800,
  },
  {
    id: 4,
    description: 'John Rowland',
    amount: -950.0,
    account: 'xxx4565494',
    status: 'Cancelled',
    method: 'Transfer',
    date: 1726734968,
  },
  {
    id: 5,
    description: "Harry's, LLC",
    amount: -24.49,
    account: 'xxx4565494',
    status: 'Complete',
    method: 'Credit',
    date: 1726734968,
  },
  {
    id: 6,
    description: "Game's Store",
    amount: -89.49,
    account: 'xxx4565494',
    status: 'Complete',
    method: 'Credit',
    date: 1726632000,
  },
  {
    id: 9,
    description: 'Monthly Pay',
    amount: 4331.57,
    account: 'xxx4565494',
    status: 'Complete',
    method: 'Credit',
    date: 1726286400,
  },
  {
    id: 8,
    description: 'Park Groceries',
    amount: -31.22,
    account: 'xxx4565494',
    status: 'Complete',
    method: 'Credit',
    date: 1726286400,
  },
];

export function useTransactions(
  userId: string,
  selector?: (transactions: Transaction[]) => typeof transactions,
) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const api = useApi();
  React.useEffect(() => {
    async function getTransactions() {
      if (isLoading) {
        let transactionsResponse = await api.transactions(userId);
        console.dir(transactionsResponse);
        if (transactionsResponse.error || transactionsResponse.data === null) {
          await api.createUser(userId);
          transactionsResponse = await api.transactions(userId);
        }
        const sorted = transactionsResponse.data.sort((a, b) => b.date - a.date);
        const selectedTransactions = selector?.(sorted) ?? sorted;
        setTransactions(selectedTransactions);
        setIsLoading(false);
      }
    }

    getTransactions();
  }, [isLoading]);

  const balance = React.useMemo(
    () => transactions.reduce((total, t) => total + Math.round(t.amount * 100), 0) / 100,
    [transactions],
  );

  return {transactions, balance, isLoading, setIsLoading};
}
