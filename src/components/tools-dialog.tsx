import { Check, ToolCase } from 'lucide-react';

import { useChat } from './chat-provider';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { CHAT_TOOLS } from '@/lib/tools';
import { useCallback } from 'react';

export const ToolsDialog: React.FC = () => {
  const { tools, setTools } = useChat();
  const isMobile = useIsMobile();

  const onClick = useCallback(
    (toolName: string) => {
      if (tools.includes(toolName)) {
        setTools((prev) => prev.filter((t) => t !== toolName));
      } else {
        setTools((prev) => [...prev, toolName]);
      }
    },
    [setTools, tools]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={isMobile ? 'icon' : 'default'} variant='outline' className='relative'>
          {!!tools.length && (
            <div className='absolute top-1 right-1 bg-blue-500 w-2 h-2 rounded-full' />
          )}

          {isMobile ? <ToolCase /> : 'Tools'}
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tools</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col gap-2 overflow-y-auto max-w-full min-w-0 max-h-80'>
            {CHAT_TOOLS.map((tool) => (
              <Button
                key={tool.name}
                variant={tools.includes(tool.name) ? 'outline' : 'ghost'}
                className='relative flex-col h-auto max-h-none justify-start items-start whitespace-normal text-left font-normal'
                onClick={() => onClick(tool.name)}
              >
                {tools.includes(tool.name) && <Check className='absolute top-2 right-2' />}

                <p className='font-semibold'>{tool.title || tool.name}</p>

                {tool.config?.function?.description && <p>{tool.config.function.description}</p>}
              </Button>
            ))}
          </div>

          <p className='text-sm text-muted-foreground text-center'>
            Tool usage isn't supported by all models.
          </p>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
