import React from 'react';
import {Loader2Icon, PlusIcon} from 'lucide-react';
import {cva} from 'class-variance-authority';
import {cn} from '#utils/cn.ts';

type ButtonBlobProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  isDisabled?: boolean;
  isLoading?: boolean;
};

const styles = cva(
  'h-11 w-11 p-1 rounded-full relative z-10 shadow-accent/30 [box-shadow:0_0_36px_3px_var(--tw-shadow-color)] hover:shadow-accent/10 transition-all',
  {
    variants: {
      isDisabled: {
        true: 'bg-secondary cursor-not-allowed shadow-accent/0',
        false: 'bg-accent',
      },
      isLoading: {
        true: 'shadow-accent/50',
        false: '',
      },
    },
  },
);

const ButtonBlob = React.forwardRef<HTMLButtonElement, ButtonBlobProps>(
  ({children, isDisabled = false, isLoading = false, className = '', ...props}, ref) => {
    return (
      <div className="relative my-12 -mr-6">
        <BlobBG className="pointer-events-none text-surface absolute top-[-34px] right-[-16.5px] stroke-border stroke-1 [stroke-dasharray:72_149_74] z-0" />
        <button
          ref={ref}
          disabled={isDisabled || isLoading}
          className={cn(styles({isDisabled, isLoading}), className)}
          {...props}
        >
          <span className="sr-only">{children}</span>
          {isLoading ? (
            <Loader2Icon className="w-9 h-9 animate-spin" />
          ) : (
            <PlusIcon className="w-9 h-9" />
          )}
        </button>
      </div>
    );
  },
);

const BlobBG = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
  return (
    <svg
      ref={ref}
      width="72"
      height="111"
      viewBox="0 0 72 111"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M70 55.72L69.9997 55.8596L70 56C70 70.6898 60.9502 83.2659 48.1217 88.4572C47.7858 88.6051 47.4473 88.7485 47.1061 88.8871C39.4772 91.9872 32 97.9905 32 105.943L32 111H17V95.0482C17 89.4483 13.8526 84.445 9.94263 80.4362C3.79049 74.1287 0 65.507 0 56C0 46.623 3.68757 38.1072 9.69166 31.8237C13.7142 27.614 16.9984 22.417 17 16.5947V0H32V5.07547C32 13.0284 39.4772 19.4528 47.1061 22.5529C60.5604 28.0202 70 40.8118 70 55.72Z" />
    </svg>
  );
});

export {ButtonBlob};
