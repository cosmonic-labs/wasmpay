'use client';

import {motion, AnimatePresence} from 'framer-motion';
import {ArrowUpRight, ArrowDownLeft} from 'lucide-react';
import {EmptyTransactionState} from './empty-state';
import {Button} from '@/components/ui/button';
import {Bank, Transaction} from '@repo/common/types';
import {Loader} from '@/components/ui/loader';
import {useTransactionForm} from '@/features/transactions/context/use-transaction-form';
import {cva} from 'class-variance-authority';
import {cn} from '@/lib/utils';

export function Transactions({
  transactions,
  isLoading,
}: {
  transactions: Transaction[];
  isLoading: boolean;
}) {
  const {openForm, banks} = useTransactionForm();

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
              <TransactionRow
                transaction={transaction}
                banks={banks.all}
                userBank={banks.user}
                key={transaction.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function TransactionRow({
  transaction,
  banks,
  userBank,
}: {
  transaction: Transaction;
  banks: Bank[];
  userBank: Bank | undefined;
}) {
  const {amount, status, origin, destination, currency} = transaction;
  const isSending = origin === userBank?.code;
  const bankName = banks.find((bank) => bank.code === destination)?.name;
  const action = isSending ? 'Sent' : 'Requested';
  const preposition = isSending ? 'to' : 'from';
  const symbol = currencySymbol[currency as keyof typeof currencySymbol];
  const amountWithSymbol = `${symbol}${amount} ${currency}`;

  return (
    <motion.div
      key={transaction.id}
      initial={{opacity: 0, y: -10}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 10}}
      className="flex items-center justify-between p-2 border-b"
    >
      <div className="flex items-center gap-2">
        <TransactionStatus status={status as 'approved'} />
        <div className="p-1 rounded-full bg-current/10 text-foreground">
          {isSending ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
        </div>
        <div>
          <div className="font-medium">
            {action} <span className="underline">{amountWithSymbol}</span> {preposition} {bankName}
          </div>
          {/* // TODO: need date in response */}
          {/* <div className="text-xs text-gray-500">
            {new Date(transaction.date).toLocaleDateString()}
          </div> */}
        </div>
      </div>
      <div className={`font-medium ${isSending ? 'text-red-500' : 'text-green-500'}`}>
        {isSending ? '-' : '+'} {amountWithSymbol}
      </div>
    </motion.div>
  );
}

const currencySymbol = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  RUB: '₽',
};

type TransactionStatusProps = {
  // status: Transaction['status'];
  status: 'approved' | 'denied'; // api-gateway/http.go#L173
};

const statusClass = cva(
  'inline-block text-xs uppercase border leading-4 py-0.5 px-1.5 m-1 rounded-full border-current',
  {
    variants: {
      status: {
        approved: 'bg-green-900/50 text-green-500',
        denied: 'bg-red-900/50 text-red-500',
      },
    },
  },
);
function TransactionStatus({status}: TransactionStatusProps) {
  const text = {
    approved: 'Approved',
    denied: 'Denied',
  }[status];
  return <span className={cn(statusClass({status}))}>{text ?? status}</span>;
}
