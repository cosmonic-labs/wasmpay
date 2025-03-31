import * as React from 'react';
import {LogInIcon, VerifiedIcon} from 'lucide-react';
import {Button} from '@repo/ui/Button';
import {DashboardCard} from './DashboardCard';
import {UserInformation} from '@/App';

export function AccountStatusCard({user}: {user: UserInformation | null}): React.ReactElement {
  const stage = user ? 'success' : 'failed';

  const {text, title} = (
    {
      success: {
        title: <>Your account, {user?.name.split(' ')[0]}</>,
        text: (
          <>Your identity has been verified. You can now enjoy the full features of our platform.</>
        ),
      },
      failed: {
        title: <>Sign in</>,
        text: <>Sign in to verify your identity and access your account</>,
      },
    } satisfies Record<typeof stage, Record<'text' | 'title', React.ReactNode>>
  )[stage];

  return (
    <DashboardCard cols={5} className="py-16 px-10 h-full flex flex-col justify-center gap-8">
      {user ? (
        <h4 className="font-semibold text-sm uppercase text-muted-400">
          {user?.name.split(' ')[0]}'s Account
        </h4>
      ) : null}

      <div className="my-auto space-y-8">
        <h2 className="font-medium text-4xl tablet:text-2xl text-muted-800">{title}</h2>
        <p className="font-sans text-muted-500">{text}</p>
      </div>

      {user ? (
        <Button>
          <>
            <VerifiedIcon className="w-4 h-4" />
            Authenticated
          </>
        </Button>
      ) : (
        <Button
          onClick={() => {
            window.location.href = 'http://127.0.0.1:8000/login';
          }}
        >
          <>
            <LogInIcon className="w-4 h-4" />
            Sign in
          </>
        </Button>
      )}
    </DashboardCard>
  );
}
