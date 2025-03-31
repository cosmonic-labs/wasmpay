import {Card} from '@repo/ui/Card';
import {cn} from '@repo/ui/cn';
import * as React from 'react';

type DashboardCardProps = {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
} & React.ComponentProps<typeof Card>;

const classNames = (cols: Exclude<DashboardCardProps['cols'], undefined>): string => {
  return [
    {
      1: 'md:col-span-1',
      2: 'md:col-span-2',
      3: 'md:col-span-3',
      4: 'md:col-span-4',
      5: 'md:col-span-5',
      6: 'md:col-span-6',
      7: 'md:col-span-7',
      8: 'md:col-span-8',
      9: 'md:col-span-9',
      10: 'md:col-span-10',
      11: 'md:col-span-11',
      12: 'md:col-span-12',
    }[cols],
    'col-span-12',
  ].join(' ');
};

function DashboardCard({
  cols = 12,
  children,
  className,
  ...props
}: DashboardCardProps): React.ReactElement {
  return (
    <Card className={cn(classNames(cols), className)} {...props}>
      {children}
    </Card>
  );
}

export {DashboardCard};
