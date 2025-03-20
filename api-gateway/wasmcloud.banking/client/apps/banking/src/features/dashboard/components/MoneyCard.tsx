import * as React from 'react';
import {ArrowRightIcon} from 'lucide-react';
import {useTransactions} from '@repo/common/services/user/useTransactions';
import {DashboardCard} from './DashboardCard';
import {UserInformation} from '@/App';

interface CardMoneyProps {
  direction: 'in' | 'out';
  user: UserInformation;
}

export function MoneyCard({direction, user}: CardMoneyProps): React.ReactElement {
  const isIn = direction === 'in';
  const {transactions, balance, isLoading} = useTransactions(user.login, (transactions) =>
    transactions.filter((t) => (isIn ? t.amount >= 0 : t.amount < 0)),
  );

  return (
    <DashboardCard cols={6} className="py-16 px-10">
      <div className="h-full flex flex-col justify-between gap-7">
        <h4 className="font-heading font-semibold text-sm uppercase text-muted-400">
          Money {direction} last 30 days
        </h4>

        {isLoading ? null : (
          <div className="font-mono font-medium text-4xl text-muted-800 dark:text-white before:content-['$']">
            {balance}
          </div>
        )}

        {isLoading ? null : (
          <div className="space-y-1">
            <p className="text-muted-500">
              {transactions.length} {isIn ? 'incoming' : 'outgoing'} transaction
              {transactions.length === 1 ? '' : 's'} this month
            </p>
            <div className="w-full h-px bg-border" />
          </div>
        )}
        <div className="mt-2 text-right">
          <a href="#" className="inline-flex items-center gap-3 text-primary">
            <span className="font-medium text-base">View all</span>
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </DashboardCard>
  );
}
