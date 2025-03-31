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
        setBanks(listBanksResponse.data);
        setIsLoading(false);
      }
    }

    listBanks();
  }, [isLoading]);

  return {banks, isLoading, setIsLoading};
}
