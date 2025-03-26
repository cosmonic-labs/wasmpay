import * as React from 'react';
import {GraphCard} from './GraphCard';
import {TransactionsCard} from './TransactionsCard';
import {AccountStatusCard} from './AccountStatusCard';
import {UserInformation} from '@/App';
import {useBanks} from '../../../../../../packages/common/src/services/user/hooks/useBanks';

interface DashboardCardProps {
  user: UserInformation | null;
}

function Dashboard({user}: DashboardCardProps): React.ReactElement {
  const banks = useBanks();
  return (
    <div className="grid grid-cols-12 gap-6 pt-6 pb-20">
      <AccountStatusCard user={user} />
      {user ? (
        <>
          <GraphCard userInfo={user} />
          <TransactionsCard user={user} />
        </>
      ) : null}
      {banks.banks.map((bank) => (
        <>
          <div>{bank.id}</div>
          <div>{bank.code}</div>
          <div>{bank.name}</div>
          <div>{bank.country}</div>
          <div>{bank.currency}</div>
        </>
      ))}
    </div>
  );
}

export {Dashboard};
