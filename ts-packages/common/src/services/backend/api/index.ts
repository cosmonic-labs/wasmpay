import {postChat} from './chat.ts';
import {listBanks, getBankById, getBankByCode} from './banks.ts';
import {transactions, createTransaction} from './transactions.ts';

export default {
  transactions,
  createTransaction,
  listBanks,
  getBankById,
  getBankByCode,
  postChat,
};

export type {Bank} from './banks.ts';
export type {ChatRequest, ChatResponse} from './chat.ts';
export type {Transaction, CreateTransaction, TransactionId} from './transactions.ts';
