import {cn} from '#utils/cn.ts';
import * as React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, JSX.IntrinsicElements['button']>(
  ({className, children, ...props}, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'h-12 max-w-[220px] inline-flex justify-center items-center gap-x-2 px-6 py-2 text-sm text-primary-foreground/90 bg-primary rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:text-primary-foreground transition-all duration-300',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
