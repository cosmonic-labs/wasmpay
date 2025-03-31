import React from 'react';

export function PageContent({children}: React.PropsWithChildren) {
  return (
    <main className="py-10 lg:pl-72">
      <div className="px-4 sm:px-6 lg:px-8 max-w-screen-lg mx-auto">{children}</div>
    </main>
  );
}
