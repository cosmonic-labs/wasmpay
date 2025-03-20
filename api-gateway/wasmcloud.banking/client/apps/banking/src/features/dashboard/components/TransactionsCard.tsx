import * as React from 'react';
import {ArrowLeftRightIcon, CreditCardIcon, RotateCwIcon, SignatureIcon} from 'lucide-react';
import {useTransactions, Transaction} from '@repo/common/services/user/useTransactions';
import {DashboardCard} from './DashboardCard';
import {UserInformation} from '@/App';
import {Button} from '@repo/ui/Button';

interface TransactionsCardProps {
  user: UserInformation;
}

export function TransactionsCard({user}: TransactionsCardProps): React.ReactElement {
  const {transactions, setIsLoading} = useTransactions(user.login);
  const reload = () => {
    setIsLoading(true);
  };

  return (
    <DashboardCard cols={12}>
      <div className="p-2">
        <div className="sm:flex items-center justify-between">
          <h4 className="font-heading font-semibold text-sm uppercase">Recent Transactions</h4>
          <a className="inline-flex items-center gap-3 text-primary hover:text-primary-400 transition-colors duration-300">
            <Button onClick={() => reload()}>
              <RotateCwIcon className="w-4 h-4" />
              Refresh
            </Button>
          </a>
        </div>
        <div className="mt-7 -mb-4 overflow-x-auto text-sm">
          <TransactionsTable>
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </TransactionsTable>
        </div>
      </div>
    </DashboardCard>
  );
}

function TransactionsTable({children}: React.PropsWithChildren) {
  return (
    <table className="w-full whitespace-nowrap">
      <thead>
        <tr>
          <th className="w-1/5"></th>
          <th className="w-2/5"></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function TransactionRow({transaction}: {transaction: Transaction}) {
  const formattedDate = new Date(transaction.date * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
  });
  const formattedCurrency = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(transaction.amount);
  return (
    <tr className="font-medium">
      <td className="py-2">{formattedDate}</td>
      <td className="py-2">{transaction.description}</td>
      <td className="py-2 px-4 font-mono">{formattedCurrency}</td>
      <td className="py-2 px-4">
        <TransactionStatus status={transaction.status} />
      </td>
      <td className="py-2 px-4">
        <TransactionMethod method={transaction.method} />
      </td>
    </tr>
  );
}

function TransactionStatus({status}: {status: Transaction['status']}) {
  const colorClass = {
    Complete: 'bg-success/10 text-success',
    Processing: 'bg-warning/10 text-warning',
    'In Progress': 'bg-info/10 text-info',
    Cancelled: 'bg-danger/10 text-danger',
  }[status];
  return (
    <span className={`inline-block text-xs py-1.5 px-3 m-1 rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}

function TransactionMethod({method}: {method: Transaction['method']}) {
  const Icon = (() => {
    switch (method) {
      case 'Check':
        return SignatureIcon;
      case 'Credit':
        return CreditCardIcon;
      case 'Transfer':
        return ArrowLeftRightIcon;
    }
  })();
  const text = {
    Check: 'Check',
    Credit: 'Credit Card',
    Transfer: 'Transfer',
  }[method];

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </div>
  );
}
