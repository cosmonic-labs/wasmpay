import {useApi} from '#services/backend/hooks/useApi.ts';
import React from 'react';
import {Bank} from './useBanks';

export type Transaction = {
  id: number;
  currency: string;
  amount: string;
  origin: string;
  destination: string;
  status: string;
  reason: string;
};

export type CreateTransaction = {
  currency: string;
  amount: number;
  origin: Bank;
  destination: Bank;
  status: string;
  reason: string;
};

export type TransactionId = {
  id: string;
};

const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    currency: 'USD',
    amount: '-52.14',
    origin: "Victoria's Treats",
    destination: 'xxx4565494',
    status: 'Processing',
    reason: 'Credit',
  },
  {
    id: 2,
    currency: 'USD',
    amount: '-428.47',
    origin: 'Morgan Seis, LLC',
    destination: 'xxx4565494',
    status: 'Complete',
    reason: 'Credit',
  },
  {
    id: 7,
    currency: 'USD',
    amount: '-143.19',
    origin: 'Wallmart',
    destination: 'xxx4565494',
    status: 'Complete',
    reason: 'Check',
  },
  {
    id: 3,
    currency: 'USD',
    amount: '-112.23',
    origin: 'Wallmart',
    destination: 'xxx4565494',
    status: 'In Progress',
    reason: 'Check',
  },
  {
    id: 4,
    currency: 'USD',
    amount: '-950.00',
    origin: 'John Rowland',
    destination: 'xxx4565494',
    status: 'Cancelled',
    reason: 'Transfer',
  },
  {
    id: 5,
    currency: 'USD',
    amount: '-24.49',
    origin: "Harry's, LLC",
    destination: 'xxx4565494',
    status: 'Complete',
    reason: 'Credit',
  },
  {
    id: 6,
    currency: 'USD',
    amount: '-89.49',
    origin: "Game's Store",
    destination: 'xxx4565494',
    status: 'Complete',
    reason: 'Credit',
  },
  {
    id: 9,
    currency: 'USD',
    amount: '4331.57',
    origin: 'Monthly Pay',
    destination: 'xxx4565494',
    status: 'Complete',
    reason: 'Credit',
  },
  {
    id: 8,
    currency: 'USD',
    amount: '-31.22',
    origin: 'Park Groceries',
    destination: 'xxx4565494',
    status: 'Complete',
    reason: 'Credit',
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

  return {transactions, balance, isLoading, setIsLoading};
}
