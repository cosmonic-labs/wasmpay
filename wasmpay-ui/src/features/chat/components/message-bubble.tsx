'use client';

import {motion} from 'framer-motion';
import {cn} from '@/lib/utils';

interface MessageBubbleProps {
  text: string;
  translation?: string;
  isOutgoing: boolean;
  amount?: number;
  timestamp?: Date;
}

export function MessageBubble({
  text,
  translation,
  isOutgoing,
  amount,
  timestamp = new Date(),
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20, scale: 0.95}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{type: 'spring', stiffness: 500, damping: 30}}
      className={cn(
        'max-w-[80%] p-3 rounded-lg relative',
        isOutgoing
          ? 'bg-primary place-self-end text-primary-foreground rounded-br-none'
          : 'bg-secondary place-self-start text-secondary-foreground rounded-bl-none',
      )}
    >
      <div className="font-medium">{text}</div>

      {translation && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.3}}
          className="text-sm text-current/80 mt-1 italic border-t border-current pt-1"
        >
          {translation}
        </motion.div>
      )}

      <div className="flex justify-between items-end gap-8 mt-1">
        <div className="text-xs text-current">
          {timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
        </div>

        {amount !== undefined && (
          <div className="text-lg tabular-nums font-medium bg-green-800 text-green-300 px-2 py-0.5 rounded-full">
            ${amount}
          </div>
        )}
      </div>

      <div
        className={cn(
          'absolute bottom-0 size-3',
          isOutgoing
            ? 'right-0 translate-y-11/12 bg-primary'
            : 'left-0 translate-y-11/12 bg-secondary',
        )}
        style={{
          clipPath: isOutgoing ? 'polygon(0 0, 100% 0, 100% 100%)' : 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
    </motion.div>
  );
}
