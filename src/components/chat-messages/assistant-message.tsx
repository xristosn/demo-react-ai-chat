import { useCallback } from 'react';

import { AlertOctagon, Copy, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Markdown } from '../markdown';

import { cn } from '@/lib/utils';
import type { AiChatAssistantMessage } from '@/lib/interfaces/ai-messages';

export interface AssistantMessageProps extends AiChatAssistantMessage {
  isLast: boolean;
  isGenerating: boolean;
  onRegenarate: () => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  error,
  aborted,
  isLast,
  isGenerating,
  onRegenarate,
}) => {
  const onCopy = useCallback(() => {
    window.navigator.clipboard.writeText(content as string);
  }, [content]);

  return (
    <div className={cn(error ? 'p-2 border border-red-800 rounded-sm' : 'flex flex-col gap-2')}>
      {content && <Markdown content={content as string} />}

      {aborted && (
        <p className='flex gap-2 justify-center items-center text-muted-foreground'>
          <AlertOctagon className='size-4' /> Aborted by user
        </p>
      )}

      {((isLast && !isGenerating) || !isLast) && !error && (
        <div className='flex gap-2'>
          <Button variant='ghost' size='icon-sm' title='Copy' onClick={onCopy}>
            <Copy />
          </Button>

          <Button
            variant='ghost'
            size='icon-sm'
            title='Regenarate'
            disabled={isGenerating}
            onClick={onRegenarate}
          >
            <RefreshCw />
          </Button>
        </div>
      )}
    </div>
  );
};
