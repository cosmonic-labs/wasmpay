import {Button} from '#components/Button.tsx';
import {cn} from '#utils/cn.ts';
import {EyeIcon, EyeOffIcon} from 'lucide-react';
import * as React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, ...props}, ref) => {
    const [showPassword, togglePassword] = React.useReducer(
      (password: boolean) => !password,
      false,
    );

    const Icon = showPassword ? EyeOffIcon : EyeIcon;
    const buttonText = showPassword ? 'Hide Password' : 'Show Password';
    const type = showPassword ? 'text' : 'password';

    return (
      <div
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent p-1 pl-3 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
          className,
        )}
      >
        <input
          className="p-0 grow mr-1 bg-transparent text-inherit file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          type={type}
          ref={ref}
          {...props}
        />
        <button type="button" className="px-1.5 py-1" onClick={togglePassword}>
          <Icon className="h-4 w-4" />
          <span className="sr-only">{buttonText}</span>
        </button>
      </div>
    );
  },
);
InputPassword.displayName = 'InputPassword';

export {InputPassword};
