import {motion} from 'framer-motion';
import {PropsWithChildren} from 'react';

export function TypingIndicator({children}: PropsWithChildren) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="flex items-center gap-2 p-2 max-w-[80%]"
    >
      <div className="flex space-x-1">
        <motion.div
          animate={{y: [0, -5, 0]}}
          transition={{repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0}}
          className="w-2 h-2 bg-current rounded-full"
        />
        <motion.div
          animate={{y: [0, -5, 0]}}
          transition={{repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2}}
          className="w-2 h-2 bg-current rounded-full"
        />
        <motion.div
          animate={{y: [0, -5, 0]}}
          transition={{repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4}}
          className="w-2 h-2 bg-current rounded-full"
        />
      </div>
      <span className="text-xs text-current">{children}</span>
    </motion.div>
  );
}
