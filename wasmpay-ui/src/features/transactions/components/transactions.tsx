'use client';

import {motion, AnimatePresence} from 'framer-motion';
import {ArrowUpRight, ArrowDownLeft} from 'lucide-react';
import {EmptyTransactionState} from './empty-state';
import {Button} from '@/components/ui/button';
import {Transaction} from '@repo/common/types';
import {Loader} from '@/components/ui/loader';
import {useTransactionForm} from '@/features/transactions/context/use-transaction-form';

export function Transactions({
  transactions,
  isLoading,
}: {
  transactions: Transaction[];
  isLoading: boolean;
}) {
  const {openForm} = useTransactionForm();

  return (
    <section>
      <header className="flex items-center justify-between border-b mt-8 pb-2">
        <h3 className="font-heading font-semibold text-sm uppercase text-muted-400">
          Transactions
        </h3>
        <aside className="flex items-center gap-2">
          <Button size="sm" onClick={() => openForm('send')}>
            <ArrowUpRight size={16} />
            Send Money
          </Button>
          <Button size="sm" onClick={() => openForm('request')}>
            <ArrowDownLeft size={16} />
            Request Money
          </Button>
        </aside>
      </header>
      {isLoading && <Loader />}
      {transactions.length === 0 ? (
        <EmptyTransactionState onSendClick={() => openForm('send')} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {transactions.map((transaction) => (
              <TransationRow transaction={transaction} key={transaction.id} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function TransationRow({transaction}: {transaction: Transaction}) {
  const {amount, status, reason, origin, destination, currency} = transaction;
  // TODO: Check if the transaction is sending or receiving
  const isSending = origin === 'me';

  return (
    <motion.div
      key={transaction.id}
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -10}}
      className="flex items-center justify-between p-2 border-b"
    >
      <div className="flex items-center gap-2">
        <TransactionStatus status={status} />
        <div className={`p-1 rounded-full ${isSending ? 'bg-red-500/30' : 'bg-green-500/30'}`}>
          {isSending ? (
            <ArrowUpRight size={16} className="text-red-500" />
          ) : (
            <ArrowDownLeft size={16} className="text-green-500" />
          )}
        </div>
        <div>
          <div className="font-medium">
            {reason ? 'Sent to' : 'Requested from'} {destination}
          </div>
          {/* // TODO: need date in response */}
          {/* <div className="text-xs text-gray-500">
            {new Date(transaction.date).toLocaleDateString()}
          </div> */}
        </div>
      </div>
      <div className={`font-medium ${isSending ? 'text-red-500' : 'text-green-500'}`}>
        {isSending ? '-' : '+'} ${amount} {currency}
      </div>
    </motion.div>
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
