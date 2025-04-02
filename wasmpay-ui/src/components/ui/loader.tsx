import * as React from 'react';
import {Loader2Icon} from 'lucide-react';
import {cn} from '@/lib/utils';

const Loader = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  ({className, ...props}, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          `fixed inset-0 flex items-center justify-center bg-background-foreground/50`,
          className,
        )}
        {...props}
      >
        <Loader2Icon className="animate-spin" />
      </div>
    );
  },
);

export {Loader};
