import {cn} from '@repo/ui/cn';
import {ThemeToggle} from '@repo/ui/theme/ThemeToggle';
import {
  ArrowLeftRightIcon,
  ChartPieIcon,
  CreditCardIcon,
  HomeIcon,
  ReceiptIcon,
  SettingsIcon,
} from 'lucide-react';

const navigation = [
  {name: 'Dashboard', href: '#', icon: HomeIcon, current: true},
  {name: 'Transactions', href: '#', icon: ArrowLeftRightIcon, current: false},
  {name: 'Payments', href: '#', icon: ReceiptIcon, current: false},
  {name: 'Cards', href: '#', icon: CreditCardIcon, current: false},
  {name: 'Accounts', href: '#', icon: ChartPieIcon, current: false},
  {
    name: 'Settings',
    onClick: () => {},
    icon: SettingsIcon,
    current: false,
  },
];

export function Navigation() {
  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <MenuItem key={item.name} item={item} />
            ))}
          </ul>
        </li>
        <li className="-mx-6 mt-auto">
          <div className="block px-6 py-3">
            <ThemeToggle />
          </div>
        </li>
      </ul>
    </nav>
  );
}

const MenuItem = ({item}: {item: (typeof navigation)[number]}) => (
  <li>
    <a
      {...(item.href ? {href: item.href} : {onClick: item.onClick})}
      className={cn(
        item.current
          ? 'bg-surface-contrast/10'
          : 'opacity-40 hover:bg-surface-contrast/10 hover:opacity-100',
        ' text-surface-contrast group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition',
      )}
    >
      <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
      {item.name}
    </a>
  </li>
);
