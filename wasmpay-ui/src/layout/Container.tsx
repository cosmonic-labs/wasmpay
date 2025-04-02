import React, {HTMLProps} from 'react';
import {cn} from '@/lib/utils';

const Container = React.forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({children, className, ...props}, ref) => {
    return (
      <div ref={ref} className={cn('container mx-auto px-4 max-w-screen-lg', className)} {...props}>
        {children}
      </div>
    );
  },
);

export default Container;
