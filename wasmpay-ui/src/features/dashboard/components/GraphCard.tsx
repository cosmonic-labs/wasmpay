import * as React from 'react';
import Chart from 'react-apexcharts';
import {ArrowDownIcon, ArrowUpIcon} from 'lucide-react';
import {Transaction} from '@repo/common/services/user/useTransactions';
import {DashboardCard} from './DashboardCard';

export function GraphCard({
  transactions,
  isLoading,
  balance,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  balance: number;
  additionalInfo?: string;
}): React.ReactElement {
  let chartBalance = 0;
  const chartData = transactions.map((t, i) => {
    if (t.status !== 'Cancelled') {
      chartBalance += parseFloat(t.amount);
    }
    return {x: i, y: chartBalance.toFixed(2)};
  });
  const series: React.ComponentProps<typeof Chart>['series'] = [
    {
      data: chartData,
    },
  ];

  return (
    <DashboardCard cols={7} className="p-0">
      <div className="flex flex-col gap-4 px-8 pt-8 text-center">
        <h4 className="font-heading font-semibold text-sm uppercase text-muted-400">
          Account Balance
        </h4>
        <p>
          <span className="font-mono font-medium text-4xl before:content-['$']">
            {balance.toFixed(2)}
          </span>
        </p>
        {isLoading || transactions.length < 1 ? (
          <></>
        ) : (
          <RecentTransaction transaction={transactions[0]} />
        )}
      </div>
      <div className="overflow-hidden">
        <Chart
          className="text-primary"
          options={CHART_OPTIONS}
          series={series}
          type="area"
          width="100%"
        />
      </div>
    </DashboardCard>
  );
}

function RecentTransaction({transaction}: {transaction: Transaction}) {
  const amount = transaction.amount;
  const positive = parseFloat(amount) >= 1;
  const Icon = positive ? ArrowUpIcon : ArrowDownIcon;
  const iconClass = positive ? 'text-success' : 'text-secondary';

  return (
    <div className="flex items-center justify-center gap-x-2">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <span className="font-sans text-sm text-foreground/40">${amount}</span>
    </div>
  );
}

const CHART_OPTIONS: React.ComponentProps<typeof Chart>['options'] = {
  chart: {
    height: 250,
    type: 'area',
    toolbar: {show: false},
    parentHeightOffset: 0,
    zoom: {enabled: false},
    animations: {enabled: false},
  },
  stroke: {
    width: [2, 2, 2],
    curve: 'smooth',
  },
  colors: ['currentColor'],
  fill: {
    type: 'gradient',
    gradient: {
      colorStops: [
        {
          offset: 0,
          color: 'currentColor',
          opacity: 1,
        },
        {
          offset: 100,
          color: 'hsl(var(--ui-color-background))',
          opacity: 1,
        },
      ],
    },
  },
  legend: {show: false},
  dataLabels: {
    enabled: false,
    formatter: (val) => `$${val}`,
  },
  grid: {
    show: false,
    padding: {left: -10, right: 0, bottom: 10},
  },
  xaxis: {
    type: 'datetime',
    axisBorder: {color: 'hsl(var(--ui-color-border))'},
    axisTicks: {color: 'hsl(var(--ui-color-border))'},
    labels: {
      style: {
        colors: 'currentColor',
        fontFamily: 'unset',
        fontWeight: 'unset',
        cssClass: 'text-foreground/30 font-bold uppercase',
      },
    },
  },
  yaxis: {
    labels: {show: false},
    axisBorder: {show: false},
    axisTicks: {show: false},
  },
  tooltip: {enabled: false},
};
