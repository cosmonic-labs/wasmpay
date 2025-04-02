import React, {Suspense} from 'react';
import {ErrorBoundary} from '@/features/core/components/ErrorBoundary';
import {Loader} from '@/components/ui/loader';

type AppProviderProps = React.PropsWithChildren<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- no thanks
  providers?: React.JSXElementConstructor<any>[];
}>;

function AppProvider({children, providers = []}: AppProviderProps) {
  const Providers = ({children}: React.PropsWithChildren) =>
    providers.reduce((acc, Provider) => {
      return <Provider>{acc}</Provider>;
    }, children);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Providers>{children}</Providers>
      </Suspense>
    </ErrorBoundary>
  );
}

export {AppProvider};
