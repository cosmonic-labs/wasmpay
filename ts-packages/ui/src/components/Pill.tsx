import React, {ElementType, PropsWithChildren} from 'react';
import {cva, VariantProps} from 'class-variance-authority';
import {cn} from '#utils/cn.ts';

type PillProps = PropsWithChildren<
  {
    icon?: ElementType;
  } & Omit<VariantProps<typeof style>, 'hasIcon'>
>;

const style = cva('inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full', {
  variants: {
    hasIcon: {true: 'gap-0.5 ps-2'},
    iconEnd: {true: 'flex-row-reverse'},
    variant: {
      default: '',
      outline: 'bg-transparent',
    },
    color: {
      primary: 'bg-accent text-accent-contrast',
      secondary: 'bg-primary-foreground text-primary-contrast',
    },
  },
  compoundVariants: [
    {
      variant: 'outline',
      color: 'primary',
      className: 'border border-accent text-accent',
    },
    {
      variant: 'outline',
      color: 'secondary',
      className: 'border border-primary-foreground text-primary-foreground',
    },
  ],
  defaultVariants: {
    variant: 'default',
    color: 'primary',
  },
});

const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({icon, iconEnd = false, variant, color, children, ...props}, ref) => {
    const Icon = icon || React.Fragment;
    return (
      <div ref={ref} className={cn(style({variant, color, hasIcon: !!icon, iconEnd}))} {...props}>
        {icon && !iconEnd && <Icon className={cn('h-3.5 w-3.5')} />}
        {children}
        {icon && iconEnd && <Icon className={cn('h-3.5 w-3.5')} />}
      </div>
    );
  },
);

export {Pill};
