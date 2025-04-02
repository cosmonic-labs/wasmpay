import * as React from 'react';
import {GraphCard} from './GraphCard';
import {TransactionsCard} from './TransactionsCard';
import {AccountStatusCard} from './AccountStatusCard';
import {UserInformation} from '@/App';
import {useBanks} from '../../../../../../packages/common/src/services/user/hooks/useBanks';
import {useTransactions} from '@repo/common/services/user/useTransactions';

interface DashboardCardProps {
  user: UserInformation | null;
}

function Dashboard({user}: DashboardCardProps): React.ReactElement {
  const banks = useBanks();
  const {transactions, balance, isLoading, setIsLoading} = useTransactions(user?.login || '');

  const userBank = banks.banks.find((bank) => bank.code === 'nordhaven');
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
