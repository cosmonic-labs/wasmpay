import {FormEvent, useEffect, useRef, useState} from 'react';
import {CardContent, CardFooter, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Loader2, PlusCircle, SendHorizontalIcon} from 'lucide-react';
import {ProSwitch} from '@/features/chat/components/pro-switch';
import {MessageBubble} from '@/features/chat/components/message-bubble';
import {DashboardCard} from '@/features/dashboard/components/dashboard-card';
import {AnimatePresence} from 'framer-motion';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {useChat} from '@/features/chat/context/use-chat';

export function Chat() {
  const [inputMessage, setInputMessage] = useState('');
  const [proMode, setProMode] = useState(false);
  const {messages, loading, sendMessage, resetChat} = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();

    if (!inputMessage.trim()) return;

    sendMessage({
      pro: proMode,
      message: inputMessage,
      sourceLanguage: 'en',
      targetLanguage: 'en',
    });
    setInputMessage('');
  };

  return (
    <DashboardCard className="h-[min(500px,80lvh)] py-0 gap-0">
      <CardHeader className="border-b p-2 [.border-b]:pb-1 flex gap-1">
        <Select>
          <SelectTrigger className="w-full mb-0">
            <SelectValue placeholder="Select a bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={'secondary'} className="h-8" onClick={resetChat}>
          <PlusCircle className="w-4 h-4" />
          New chat
        </Button>
      </CardHeader>
      <CardContent className="flex-grow h-full overflow-hidden p-0">
        <ScrollArea className="size-full px-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="flex my-8 items-center justify-center h-full text-muted-foreground">
                No messages yet. Start a conversation!
              </div>
            ) : (
              <div className="space-y-4 my-4">
                {messages.map((msg, key) => (
                  <MessageBubble
                    key={msg.id}
                    // translation="yeah man"
                    amount={0}
                    isOutgoing={msg.sender === 'user'}
                    text={msg.content}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t [.border-t]:p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center w-full gap-2 bg-muted py-1 pr-1.5 pl-2.5 rounded-full"
        >
          <ProSwitch isPro={proMode} onClick={() => setProMode(!proMode)} />
          <Input
            value={inputMessage}
            placeholder="Type your message..."
            className="flex-grow border-0 focus-visible:ring-0 pl-0 bg-transparent dark:bg-transparent focus-visible:border-0"
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button size="sm" type="submit" className="p-1 h-8 rounded-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Loading
              </>
            ) : (
              'Send'
            )}
            <SendHorizontalIcon />
          </Button>
        </form>
      </CardFooter>
    </DashboardCard>
  );
}
