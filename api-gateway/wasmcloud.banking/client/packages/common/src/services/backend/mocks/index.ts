// TODO: mock these
import {transactions} from '../api/transactions.ts';
import {createUser} from '../api/createuser.ts';

type ApiMethods = typeof import('../api').default;

export default {
  transactions,
  createUser,
} satisfies ApiMethods;
