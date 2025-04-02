import * as React from 'react';
import {AccountBalance} from './account-balance';
import {Transactions} from '@/features/transactions/components/transactions';
import {Chat} from '@/features/chat/components/chat';
import {TransactionModal} from '@/features/transactions/components/transaction-modal';
import {useTransactions} from '@repo/common/hooks/useTransactions';

function Dashboard(): React.ReactElement {
  const {transactions, balance, isLoading, reloadTransactions} = useTransactions();

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-6">
        <Chat />
      </div>
      <div className="col-span-12 md:col-span-6">
        <AccountBalance transactions={transactions} balance={balance} isLoading={isLoading} />
      </div>
      <div className="col-span-12">
        <Transactions transactions={transactions} isLoading={isLoading} />
        <TransactionModal reloadTransactions={reloadTransactions} />
      </div>
    </div>
  );
}

export {Dashboard};
