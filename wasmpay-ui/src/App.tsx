import React from 'react';
import {PageContent} from '@/layout/PageContent';
import {TopNav} from '@/layout/TopNav';
import {Dashboard} from '@/features/dashboard/components/dashboard';
import {AppProvider} from '@/features/core/components/AppProvider';
import {ConfigProvider} from '@repo/common/services/config';
import {ThemeProvider} from 'next-themes';
import {TransactionFormProvider} from '@/features/transactions/context/transaction-form-context';
import {Toaster} from '@/components/ui/sonner';

export interface UserInformation {
  login: string;
  avatar_url: string;
  name: string;
}

function App() {
  return (
    <AppProvider providers={[ThemeProvider, ConfigProvider, TransactionFormProvider]}>
      <div>
        <TopNav />
        <PageContent>
          <Dashboard />
        </PageContent>
      </div>
      <Toaster />
    </AppProvider>
  );
}

export default App;
