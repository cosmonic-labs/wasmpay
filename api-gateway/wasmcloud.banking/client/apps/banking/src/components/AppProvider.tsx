import React, {Suspense} from 'react';
import {ConfigProvider} from '@repo/common/services/config/context';
import {Loader} from '@repo/ui/Loader';
import {DragPortalProvider} from '@repo/ui/drag-and-drop/DragPortalProvider';
import {ErrorBoundary} from '@/components/ErrorBoundary';

function AppProvider({children}: React.PropsWithChildren) {
  const providerComponents = [ConfigProvider, DragPortalProvider];

  const Providers = ({children}: React.PropsWithChildren) =>
    providerComponents.reduce((acc, Provider) => {
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
