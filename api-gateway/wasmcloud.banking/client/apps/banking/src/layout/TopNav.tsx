import React from 'react';
import {MenuIcon} from 'lucide-react';
import {UserInformation} from '@/App';

type TopNavProps = React.PropsWithChildren<{
  setSidebarOpen: (open: boolean) => void;
  user: UserInformation | null;
}>;

export function TopNav({setSidebarOpen, user, children}: TopNavProps) {
  const shouldShowSeparator = React.Children.count(children) > 0;

  return (
    <div className="lg:pl-72">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-foreground lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon aria-hidden="true" className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-x-4 lg:gap-x-6 w-full">
          <div className="grow" />
          {children}

          {shouldShowSeparator && <div aria-hidden="true" className="h-6 w-px bg-foreground/10" />}

          {user ? (
            <div className="flex items-center ms-auto">
              <img alt="" src={user.avatar_url} className="h-8 w-8 rounded-full bg-foreground/50" />
              <span className="hidden lg:flex lg:items-center">
                <span
                  aria-hidden="true"
                  className="ml-4 text-sm font-semibold leading-6 text-foreground"
                >
                  {user.name}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
