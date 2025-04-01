import type {Bank} from '#services/backend/api/banks.ts';
import {useApi} from '#services/backend/hooks/useApi.ts';
import React from 'react';

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
