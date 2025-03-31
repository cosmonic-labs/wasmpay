import * as React from 'react';
import {GraphCard} from './GraphCard';
import {TransactionsCard} from './TransactionsCard';
import {AccountStatusCard} from './AccountStatusCard';
import {UserInformation} from '@/App';
<<<<<<< HEAD:api-gateway/wasmcloud.banking/client/apps/banking/src/features/dashboard/components/Dashboard.tsx
import {useBanks} from '../../../../../../packages/common/src/services/user/hooks/useBanks';
import {useTransactions} from '@repo/common/services/user/useTransactions';
=======
import {Bank, useBanks} from '@repo/common/services/user/useBanks';
import {Button} from '@repo/ui/Button';
import {CreateTransaction} from '@repo/common/services/user/useTransactions';
import {useApi} from '@repo/common/services/backend/useApi';
import {ApiError} from '@repo/common/services/backend/types';
>>>>>>> 077eaef (chore: move ui and update build scripts):wasmpay-ui/src/features/dashboard/components/Dashboard.tsx

interface DashboardCardProps {
  user: UserInformation | null;
}

function Dashboard({user}: DashboardCardProps): React.ReactElement {
  const banks = useBanks();
  const {transactions, balance, isLoading, setIsLoading} = useTransactions(user?.login || '');

<<<<<<< HEAD:api-gateway/wasmcloud.banking/client/apps/banking/src/features/dashboard/components/Dashboard.tsx
  const userBank = banks.banks.find((bank) => bank.code === 'nordhaven');
=======
  const createTransaction = (origin: Bank | undefined, destination: Bank | undefined) => {
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

    api
      .createTransaction(transaction)
      .then((response) => {
        console.dir(JSON.stringify(response.data, null, 2));
        console.log(`Transaction ${response.data.id} created successfully`);
      })
      .catch((error) => {
        if (error instanceof Error) {
          if (error instanceof ApiError) {
            console.error('Error creating transaction:', error);
          } else {
            console.error('Error:', error.message);
          }
        } else {
          console.error('Unexpected error:', error);
        }
      });
  };
>>>>>>> 077eaef (chore: move ui and update build scripts):wasmpay-ui/src/features/dashboard/components/Dashboard.tsx
  return (
    <div className="grid grid-cols-12 gap-6 pt-6 pb-20">
      <AccountStatusCard user={user} />
      {user ? (
        <>
          <GraphCard transactions={transactions} balance={balance} isLoading={isLoading} />
          {userBank ? (
            <TransactionsCard
              banks={banks.banks}
              userBank={userBank}
              transactions={transactions}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            console.error('No user bank found in the system')
          )}
        </>
      ) : null}
    </div>
  );
}

export {Dashboard};
