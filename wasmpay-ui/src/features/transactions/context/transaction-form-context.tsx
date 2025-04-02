import {useBanks} from '@repo/common/hooks/useBanks';
import {Bank} from '@repo/common/types';
import * as React from 'react';

type TransactionFormContextType = {
  isOpen: boolean;
  openForm: (mode: 'send' | 'request') => void;
  closeForm: () => void;
  mode: 'send' | 'request';
  banks: {
    all: Bank[];
    user: Bank | undefined;
    filtered: Bank[];
  };
  form: {
    origin?: string;
    destination?: string;
    amount?: number;
    currency?: string;
  };
  updateForm: (key: string, value: string | number) => void;
  clearForm: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components -- this is a context provider
export const TransactionFormContext = React.createContext<TransactionFormContextType>({
  isOpen: false,
  mode: 'send',
  banks: {
    all: [],
    user: undefined,
    filtered: [],
  },
  form: {},
  updateForm: () => undefined,
  clearForm: () => undefined,
  openForm: () => undefined,
  closeForm: () => undefined,
});

const USER_BANK_CODE = 'nordhaven';

export function TransactionFormProvider({children}: {children: React.ReactNode}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'send' | 'request'>('send');
  const {banks: allBanks} = useBanks();
  const userBank = allBanks.find((b) => b.code === USER_BANK_CODE);
  const banks = {
    all: allBanks,
    user: userBank,
    filtered: allBanks.filter((b) => b.code !== USER_BANK_CODE),
  };

  const [form, setForm] = React.useState({
    origin: '',
    destination: '',
    amount: 0,
    currency: '',
  });
  const openForm = React.useCallback(
    (mode: 'send' | 'request') => {
      const defaultBankIfOnlyOne = banks.filtered.length === 1 ? banks.filtered[0] : undefined;
      if (mode === 'request') {
        setForm((prev) => ({
          ...prev,
          // requesting from other bank to user bank
          origin: defaultBankIfOnlyOne?.id || '',
          destination: userBank?.id || '',
          currency: defaultBankIfOnlyOne?.currency || '',
          amount: 0,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          // sending from user bank to other bank
          destination: defaultBankIfOnlyOne?.id || '',
          origin: userBank?.id || '',
          currency: defaultBankIfOnlyOne?.currency || '',
          amount: 0,
        }));
      }
      setMode(mode);
      setIsOpen(true);
    },
    [banks.filtered, userBank],
  );

  const clearForm = React.useCallback(() => {
    setForm({
      origin: '',
      destination: '',
      amount: 0,
      currency: '',
    });
  }, []);

  const closeForm = React.useCallback(() => {
    setIsOpen(false);
    clearForm();
  }, [clearForm]);

  const updateForm = React.useCallback((key: string, value: string | number) => {
    setForm((prev) => ({...prev, [key]: value}));
  }, []);

  return (
    <TransactionFormContext.Provider
      value={{isOpen, openForm, closeForm, mode, form, updateForm, clearForm, banks}}
    >
      {children}
    </TransactionFormContext.Provider>
  );
}
