import * as React from 'react';

type TransactionFormContextType = {
  isOpen: boolean;
  openForm: (mode: 'send' | 'request') => void;
  closeForm: () => void;
  mode: 'send' | 'request';
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
  form: {},
  updateForm: () => undefined,
  clearForm: () => undefined,
  openForm: () => undefined,
  closeForm: () => undefined,
});

const USER_BANK_ID = 'bk_s5MuMcA';

export function TransactionFormProvider({children}: {children: React.ReactNode}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'send' | 'request'>('send');

  const [form, setForm] = React.useState({
    origin: '',
    destination: '',
    amount: 0,
    currency: '',
  });

  const openForm = (mode: 'send' | 'request') => {
    if (mode === 'send') {
      setForm((prev) => ({...prev, origin: USER_BANK_ID}));
    } else {
      setForm((prev) => ({...prev, destination: USER_BANK_ID}));
    }
    setMode(mode);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    clearForm();
  };

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({...prev, [key]: value}));
  };

  const clearForm = () => {
    setForm({
      origin: '',
      destination: '',
      amount: 0,
      currency: '',
    });
  };

  return (
    <TransactionFormContext.Provider
      value={{isOpen, openForm, closeForm, mode, form, updateForm, clearForm}}
    >
      {children}
    </TransactionFormContext.Provider>
  );
}
