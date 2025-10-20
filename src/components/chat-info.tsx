import { useEffect, useMemo, useState } from 'react';

import { Trash } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import type { AiChat } from '@/lib/interfaces/ai-chat';
import { timeAgo } from '@/lib/utils';

export interface ChatInfoProps {
  chat: AiChat;
  onDelete: () => void;
  isGenerating: boolean;
}

export const ChatInfo: React.FC<ChatInfoProps> = ({ chat, isGenerating, onDelete }) => {
  const [updated, setUpdated] = useState(timeAgo(chat.updated));

  const visibleMessage = useMemo(
    () =>
      chat.messages.filter(
        (m) => m.role === 'user' || (m.role === 'assistant' && !m.tool_calls?.length)
      ).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chat.messages.map((m) => m.role).join('')]
  );

  const onDeleteClick = () => {
    if (confirm('Are you sure you want to delete this Chat?')) {
      onDelete();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setUpdated(timeAgo(chat.updated)), 60_000);
    return () => clearInterval(interval);
  }, [chat.updated]);

  return (
    <div className='flex flex-col gap-4 pt-8 md:pt-0'>
      <div className='flex gap-4 justify-between'>
        <h1 className='text-4xl'>{chat.title}</h1>

        <Button size='icon' variant='secondary' disabled={isGenerating} onClick={onDeleteClick}>
          <Trash />
        </Button>
      </div>

      <p className='text-muted-foreground'>
        Updated {updated} · {visibleMessage} messages
      </p>

      <Separator />
    </div>
  );
};
