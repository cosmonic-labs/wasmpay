import {Moon, Sun, Monitor, LucideProps} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import {useTheme} from 'next-themes';
import {cn} from '@/lib/utils';

export function ThemeSelector() {
  const {theme, setTheme} = useTheme();

  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
      <ThemeButton
        isActive={theme === 'light'}
        icon={Sun}
        label="Light"
        onClick={() => setTheme('light')}
      />
      <ThemeButton
        isActive={theme === 'dark'}
        icon={Moon}
        label="Dark"
        onClick={() => setTheme('dark')}
      />
      <ThemeButton
        isActive={theme === 'system'}
        icon={Monitor}
        label="System"
        onClick={() => setTheme('system')}
      />
    </div>
  );
}

type ThemeButtonProps = {
  isActive: boolean;
  icon: React.FC<LucideProps>;
  label: string;
  onClick: () => void;
};
function ThemeButton({icon: Icon, label, isActive, onClick}: ThemeButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('rounded-full p-1 size-6 hover:bg-background', isActive && 'bg-background')}
          onClick={onClick}
        >
          <Icon className="size-3.5" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
