import {ChatContext} from './chat-context';
import * as React from 'react';

export function useChat() {
  const chat = React.useContext(ChatContext);
  if (!chat) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return chat;
}
