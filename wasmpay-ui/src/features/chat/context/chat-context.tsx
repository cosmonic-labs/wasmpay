import {useApi} from '@repo/common/services/backend/useApi';
import React from 'react';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
  proMode?: boolean;
  translation?: string;
  currency?: string;
  amount?: number;
};

type ChatContextType = {
  messages: Message[];
  sendMessage: (request: {
    pro: boolean;
    message: string;
    sourceLanguage: string;
    targetLanguage: string;
  }) => void;
  resetChat: () => void;
  bank: string | undefined;
  setBank: (bank: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

// eslint-disable-next-line react-refresh/only-export-components -- false positive for provider and context
export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [bank, setBank] = React.useState<string>();
  const {postChat} = useApi();

  const sendMessage = React.useCallback(
    async (req: {
      pro: boolean;
      message: string;
      sourceLanguage: string;
      targetLanguage: string;
    }) => {
      const {message, sourceLanguage, targetLanguage} = req;
      if (!message.trim()) return;
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setLoading(true);

      const response = await postChat({
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
        text: message,
      });
      const systemMessage: Message = {
        id: Date.now().toString(),
        content: response.data,
        sender: 'system',
        timestamp: new Date(),
        proMode: req.pro,
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
      setLoading(false);
    },
    [postChat],
  );

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{messages, sendMessage, resetChat, bank, setBank, loading, setLoading}}
    >
      {children}
    </ChatContext.Provider>
  );
};
