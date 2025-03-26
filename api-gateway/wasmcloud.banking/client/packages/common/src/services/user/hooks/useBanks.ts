import {useApi} from '#services/backend/hooks/useApi.ts';
import React from 'react';

export type Bank = {
  id: string;
  code: string;
  name: string;
  country: string;
  currency: string;
};

const BANKS: Bank[] = [
  {
    id: '1',
    code: 'BANK1',
    name: 'Bank One',
    country: 'USA',
    currency: 'USD',
  },
  {
    id: '2',
    code: 'BANK2',
    name: 'Bank Two',
    country: 'Canada',
    currency: 'CAD',
  },
  {
    id: '3',
    code: 'BANK3',
    name: 'Bank Three',
    country: 'UK',
    currency: 'GBP',
  },
];

export function useBanks() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const api = useApi();
  React.useEffect(() => {
    async function listBanks() {
      if (isLoading) {
        let listBanksResponse = await api.listBanks();
        console.dir(listBanksResponse);
        // if (listBanksResponse.error || listBanksResponse.data === null) {
        //   await api.createUser(userId);
        //   listBanksResponse = await api.transactions(userId);
        // }
        // const sorted = listBanksResponse.data.sort((a, b) => b.date - a.date);
        // const selectedTransactions = selector?.(sorted) ?? sorted;
        setBanks(listBanksResponse.data);
        setIsLoading(false);
      }
    }

    listBanks();
  }, [isLoading]);

  //   const balance = React.useMemo(
  //     () => transactions.reduce((total, t) => total + Math.round(t.amount * 100), 0) / 100,
  //     [transactions],
  //   );

  return {banks, isLoading, setIsLoading};
}
