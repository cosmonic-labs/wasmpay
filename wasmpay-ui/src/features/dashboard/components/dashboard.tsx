import * as React from 'react';
import {AccountBalance} from './account-balance';
import {Transactions} from '@/features/transactions/components/transactions';
import {Chat} from '@/features/chat/components/chat';
import {TransactionModal} from '@/features/transactions/components/transaction-modal';

function Dashboard(): React.ReactElement {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-6">
        <Chat />
      </div>
      <div className="col-span-12 md:col-span-6">
        <AccountBalance />
      </div>
      <div className="col-span-12">
        <Transactions />
        <TransactionModal />
      </div>
    </div>
  );
}

export {Dashboard};
