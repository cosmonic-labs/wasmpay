import * as React from 'react';
import {ArrowDownToLineIcon, ArrowUpFromLineIcon} from 'lucide-react';
import {useTransactions, Transaction} from '@repo/common/services/user/useTransactions';
import {DashboardCard} from './DashboardCard';
import {UserInformation} from '@/App';
import {Button} from '@repo/ui/Button';
import {TransactionCard} from './TransactionCard';

interface TransactionsCardProps {
  user: UserInformation;
}

export function TransactionsCard({user}: TransactionsCardProps): React.ReactElement {
  const {transactions} = useTransactions(user.login);
  const [showTransactionPopUp, setShowTransactionPopUp] = React.useState(false);

  return (
    <DashboardCard cols={12}>
      {showTransactionPopUp ? <TransactionCard /> : null}
      <div className="p-2">
        <div className="sm:flex items-center justify-between">
          <h4 className="font-heading font-semibold text-sm uppercase">Recent Transactions</h4>
          <a className="inline-flex items-center gap-3 text-primary hover:text-primary-400 transition-colors duration-300">
            <Button onClick={() => setShowTransactionPopUp(true)}>
              <ArrowUpFromLineIcon className="w-4 h-4" />
              Send Money
            </Button>
            <Button onClick={() => setShowTransactionPopUp(true)}>
              <ArrowDownToLineIcon className="w-4 h-4" />
              Request Money
            </Button>
          </a>
        </div>
        <div className="mt-7 -mb-4 overflow-x-auto text-sm">
          <TransactionsTable>
            {transactions
              ? transactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              : null}
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
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function TransactionRow({transaction}: {transaction: Transaction}) {
  // TODO: transactin date
  const formattedDate = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
  });
  const formattedCurrency = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(transaction.amount));
  return (
    <tr className="font-medium">
      <td className="py-2">{formattedDate}</td>
      <td className="py-2">{transaction.origin}</td>
      <td className="py-2 px-4 font-mono">{formattedCurrency}</td>
      <td className="py-2 px-4">
        <TransactionStatus status={transaction.status} />
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
