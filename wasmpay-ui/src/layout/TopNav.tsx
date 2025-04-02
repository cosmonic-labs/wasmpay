import {ThemeSelector} from '@/features/settings/theme-selector';
import React from 'react';

type TopNavProps = React.PropsWithChildren;

export function TopNav({children}: TopNavProps) {
  const shouldShowSeparator = React.Children.count(children) > 0;

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-x-4 lg:gap-x-6 w-full">
        <div className="flex gap-2 items-center">
          <CompanyLogo />
          <span className="text-lg font-semibold text-primary dark:text-white">WasmPay</span>
        </div>
        <div className="grow" />

        {children}

        {shouldShowSeparator && <div aria-hidden="true" className="h-6 w-px bg-foreground/10" />}
        <div className="flex items-center ms-auto">
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}

const CompanyLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1000 1000"
    className="h-8 w-auto text-primary dark:text-white"
  >
    <circle cx="500" cy="500" r="500" fill="currentColor" opacity="0.4" />
  </svg>
);
