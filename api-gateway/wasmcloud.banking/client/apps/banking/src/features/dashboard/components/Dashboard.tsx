import * as React from 'react';
import {GraphCard} from './GraphCard';
import {TransactionsCard} from './TransactionsCard';
import {AccountStatusCard} from './AccountStatusCard';
import {UserInformation} from '@/App';
import {Bank, useBanks} from '../../../../../../packages/common/src/services/user/hooks/useBanks';
import {Button} from '@repo/ui/Button';
import {CreateTransaction} from '@repo/common/services/user/useTransactions';
import {useApi} from '@repo/common/services/backend/useApi';
import {isStandardErrorResponse} from '../../../../../../packages/common/src/services/backend/api/transactions';

interface DashboardCardProps {
  user: UserInformation | null;
}

function Dashboard({user}: DashboardCardProps): React.ReactElement {
  const banks = useBanks();
  const api = useApi();

  const createTransaction = (origin: Bank | undefined, destination: Bank | undefined) => {
    if (!origin || !destination) {
      console.error('Bank not found');
      return;
    }
    const transaction: CreateTransaction = {
      currency: origin.currency,
      amount: 100,
      origin,
      destination,
      status: 'Pending',
      reason: '',
    };

    api
      .createTransaction(transaction)
      .then((response) => {
        console.dir(JSON.stringify(response.data, null, 2));
        console.log(`Transaction ${response.data.id} created successfully`);
      })
      .catch((error) => {
        // handle the transaction failed response
        if ('response' in error && isStandardErrorResponse(error.response)) {
          // TODO: surface in UI
          console.error(error.response.message);
        } else {
          console.dir(error);
        }
      });
  };
  return (
    <div className="grid grid-cols-12 gap-6 pt-6 pb-20">
      <AccountStatusCard user={user} />
      {user ? (
        <>
          <GraphCard userInfo={user} />
          <TransactionsCard user={user} />
        </>
      ) : null}
      <Button
        onClick={() =>
          createTransaction(
            banks.banks.find((bank) => bank.code === 'nordhaven'),
            banks.banks.find((bank) => bank.code === 'icamer'),
          )
        }
      >
        PRESS ME FOR TRANSACTION
      </Button>
      <Button
        onClick={() =>
          createTransaction(
            {
              id: 'bk_t37k3Fl',
              code: 'BANK1',
              name: 'Bank One',
              country: 'EUR',
              currency: 'FRA',
            },
            banks.banks.find((bank) => bank.code === 'nordhaven'),
          )
        }
      >
        PRESS ME FOR BAD TRANSACTION
      </Button>
      {banks
        ? banks.banks.map((bank) => (
            <>
              <div>{bank.id}</div>
              <div>{bank.code}</div>
              <div>{bank.name}</div>
              <div>{bank.country}</div>
              <div>{bank.currency}</div>
            </>
          ))
        : null}
    </div>
  );
}

export {Dashboard};
