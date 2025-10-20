import { useEffect, useMemo, useRef, useState } from 'react';

import { Check, Eraser } from 'lucide-react';
import { useLLMProvider } from '@/hooks/use-llm-provider';

import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChat } from './chat-provider';

import { cn } from '@/lib/utils';

export const ChatModelsList: React.FC = () => {
  const { models } = useChat();
  const { model, setModel } = useLLMProvider();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const modelRef = useRef<HTMLButtonElement>(null);

  const canExpand = useMemo(() => models.some((m) => m.description), [models]);

  const filteredModels = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return models;

    return models.filter(
      (m) => m.id.toLowerCase().includes(query) || m.name?.toLowerCase().includes(query)
    );
  }, [search, models]);

  useEffect(() => {
    const timeout = setTimeout(
      () => modelRef.current?.scrollIntoView?.({ behavior: 'smooth' }),
      300
    );
    return () => clearTimeout(timeout);
  }, []);

  if (!models?.length) return null;

  return (
    <div className='py-2 border rounded-md max-w-full min-w-0 overflow-hidden'>
      <div className='flex gap-2 justify-between align-middle px-4 pb-2'>
        <h6 className='text-muted-foreground'>Available Models ({models.length}):</h6>

        {canExpand && (
          <div className='flex gap-2 items-center'>
            <FieldLabel className='text-muted-foreground' htmlFor='expanded-model-view'>
              Expanded view
            </FieldLabel>

            <Checkbox
              id='expanded-model-view'
              checked={expanded}
              onCheckedChange={(v) => setExpanded(!!v)}
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          'overflow-y-auto overflow-x-hidden flex flex-col transition-[max-height] px-4 pt-2 max-w-full min-w-0',
          expanded ? 'gap-4 max-h-80' : 'gap-2 max-h-56'
        )}
      >
        {models.length > 1 && (
          <div className='relative mb-2'>
            <Input
              className='pr-10'
              placeholder='Search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              className='absolute top-1 right-2 size-7'
              size='icon-sm'
              variant='outline'
              onClick={() => setSearch('')}
              disabled={!search?.trim()}
            >
              <Eraser />
            </Button>
          </div>
        )}

        {filteredModels.map((m) => (
          <Button
            key={m.id}
            ref={m.id === model?.id ? modelRef : undefined}
            variant={m.id === model?.id ? 'outline' : 'ghost'}
            className='flex flex-col gap-2 cursor-pointer text-left justify-start items-start whitespace-normal max-h-none h-auto max-w-full min-w-0'
            tabIndex={0}
            onClick={() => setModel(m)}
          >
            <div className='flex gap-2 w-full justify-between items-center'>
              <p className='text-sm'>{m.name || m.id}</p>

              {model?.id === m.id && <Check />}
            </div>

            {expanded && m.description && (
              <p className='text-sm text-muted-foreground max-w-full min-w-0'>{m.description}</p>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
