import {motion} from 'framer-motion';
import {ArrowDownUp} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface EmptyStateProps {
  onSendClick: () => void;
}

export function EmptyTransactionState({onSendClick}: EmptyStateProps) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{scale: 0}}
        animate={{scale: 1}}
        transition={{type: 'spring', delay: 0.2}}
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4"
      >
        <ArrowDownUp size={24} className="text-primary-foreground" />
      </motion.div>

      <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
      <p className="text-muted-foreground mb-4 max-w-xs">
        Start sending or requesting money to see your transaction history here.
      </p>

      <Button onClick={onSendClick}>Send Your First Payment</Button>
    </motion.div>
  );
}
