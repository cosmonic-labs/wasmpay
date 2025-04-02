import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {cva} from 'class-variance-authority';

const proMode = cva(
  'group flex gap-0 justify-between p-1 relative h-6 w-14 rounded-full transition-colors duration-200 ease-in-out hover:bg-purple-700 hover:text-purple-300',
  {
    variants: {
      isPro: {
        true: 'bg-purple-800 text-purple-300',
        false: 'bg-background/50 text-foreground/50',
      },
    },
  },
);

type ProSwitchProps = {
  isPro: boolean;
  onClick: () => void;
};
export function ProSwitch({isPro, onClick}: ProSwitchProps) {
  return (
    <Button
      className={cn(proMode({isPro}))}
      type="button"
      role="switch"
      data-checked={isPro}
      aria-checked={isPro}
      onClick={onClick}
    >
      <span className="relative inline-block size-4 transform rounded-full bg-current transition-all group-data-[checked=true]:translate-x-8" />
      <span className="relative uppercase text-xs p-0.5 font-medium transition-all group-data-[checked=true]:-translate-x-4.5">
        PRO
      </span>
    </Button>
  );
}
