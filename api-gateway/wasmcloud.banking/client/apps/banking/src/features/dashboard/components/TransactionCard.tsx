import React from 'react';
import {ButtonBlob} from '@repo/ui/ButtonBlob';
import {Card} from '@repo/ui/Card';
import {cn} from '@repo/ui/cn';

const TransactionCard = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  ({className, ...props}, ref) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <Card ref={ref} className={cn('relative', className)} {...props}>
          <div className="">Sup</div>
          <div className="flex flex-col gap-2 mt-2 empty:mt-0">gib transaction</div>
          <div className="top-0 right-0 absolute">
            <ButtonBlob
              // onClick={reset}
              className="text-surface"
              isDisabled={status === 'idle'}
              isLoading={status === 'uploading' || status === 'processing'}
            >
              hi button
            </ButtonBlob>
          </div>
        </Card>
      </div>
    );
  },
);

export {TransactionCard};
