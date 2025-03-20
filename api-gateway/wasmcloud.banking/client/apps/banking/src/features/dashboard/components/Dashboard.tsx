import * as React from 'react';
import {MoneyCard} from './MoneyCard';
import {GraphCard} from './GraphCard';
import {TransactionsCard} from './TransactionsCard';
import {AccountStatusCard} from './AccountStatusCard';
import {UserInformation} from '@/App';

interface DashboardCardProps {
  user: UserInformation | null;
}

function Dashboard({user}: DashboardCardProps): React.ReactElement {
  return (
    <div className="grid grid-cols-12 gap-6 pt-6 pb-20">
      <AccountStatusCard user={user} />
      {user ? (
        <>
          <GraphCard userInfo={user} />
          <MoneyCard direction="in" user={user} />
          <MoneyCard direction="out" user={user} />
          <TransactionsCard user={user} />
        </>
      ) : null}
    </div>
  );
}

export {Dashboard};
