import {motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {CheckCircle, AlertCircle} from 'lucide-react';

interface TransactionAnimationProps {
  type: 'send' | 'receive' | 'error';
  amount: number;
  onComplete: () => void;
}

export function TransactionAnimation({type, amount, onComplete}: TransactionAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.8}}
      animate={{opacity: 1, scale: 1}}
      exit={{opacity: 0, scale: 0.8}}
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    >
      <motion.div
        className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center"
        initial={{y: 50}}
        animate={{y: 0}}
      >
        <motion.div
          initial={{scale: 0}}
          animate={{scale: 1}}
          transition={{type: 'spring', delay: 0.2}}
          className="mb-4"
        >
          {type === 'error' ? (
            <AlertCircle size={64} className="text-red-500" />
          ) : (
            <CheckCircle
              size={64}
              className={type === 'send' ? 'text-purple-600' : 'text-green-500'}
            />
          )}
        </motion.div>

        <motion.p
          className="text-xl font-bold mb-2"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.4}}
        >
          {type === 'send'
            ? 'Money Sent!'
            : type === 'receive'
            ? 'Money Received!'
            : 'Transaction Failed'}
        </motion.p>

        <motion.p
          className={`text-3xl font-bold ${type === 'error' ? 'text-red-500' : ''}`}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.6}}
        >
          ${amount}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
