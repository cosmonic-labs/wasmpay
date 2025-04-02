import {listBanks, getBankById, getBankByCode} from './banks.ts';
import {transactions, createTransaction} from './transactions.ts';

export default {
  transactions,
  createTransaction,
  listBanks,
  getBankById,
  getBankByCode,
};

export type {Bank} from './banks.ts';
export type {Transaction, CreateTransaction, TransactionId} from './transactions.ts';
