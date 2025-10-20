import { useEffect, useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { useLLMProvider } from '@/hooks/use-llm-provider';
import { useChat } from './chat-provider';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ApiKeysForm } from './api-keys-form';
import { ChatModelsList } from './chat-models-list';

import { getModels } from '@/lib/openai';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LLM_PROVIDERS } from '@/lib/chat-providers';

export const ProviderDialog: React.FC = () => {
  const { provider, apiKey, setProvider, model, setModel, providerError } = useLLMProvider();
  const { models, setModels } = useChat();
  const isMobile = useIsMobile();
  const fetchingModelsRef = useRef(false);

  useEffect(() => {
    if (models.length) return;
    if (!provider.id) return;
    if (provider.requiresApiKey && !apiKey) return;
    if (fetchingModelsRef.current) return;

    fetchingModelsRef.current = true;

    (async () => {
      try {
        const newModels = await getModels(provider, apiKey);
        setModels(newModels);

        if (!model) {
          setModel(newModels[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Could not update models list', {
          dismissible: true,
          description: (err as Error)?.message || '',
        });
      } finally {
        fetchingModelsRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.id, apiKey, model?.id, models.length]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className='relative'
          size={isMobile ? 'icon' : 'default'}
          variant='outline'
          title={[
            model?.name || model?.id,
            (model?.name || model?.id) && 'by',
            provider.label,
            model?.ownedBy && `(owned by ${model.ownedBy})`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {!isMobile && (model?.name || model?.id)}

          <provider.icon />

          {providerError && (
            <span className='text-xs text-red-500 absolute top-0.5 right-0.5'>
              <AlertTriangle className='size-2.5' />
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogContent className='w-full lg:max-w-xl min-w-0'>
          <DialogHeader>
            <DialogTitle asChild>
              <motion.h2 layout>Choose an LLM Provider</motion.h2>
            </DialogTitle>
          </DialogHeader>

          <motion.div layout className='flex py-2 flex-wrap gap-4'>
            {LLM_PROVIDERS.map((llmProvider, idx) => (
              <motion.div
                key={llmProvider.id}
                initial={{ translateY: '10%', opacity: 0 }}
                animate={{ translateY: '0', opacity: 1 }}
                transition={{ delay: 0.1 * (idx + 1), duration: 0.1 }}
              >
                <Button
                  size={isMobile ? 'default' : 'lg'}
                  variant={provider.id === llmProvider.id ? 'default' : 'outline'}
                  onClick={() => setProvider(llmProvider.id)}
                >
                  <llmProvider.icon /> {llmProvider.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence>
            {!!models.length && (
              <motion.div
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className='max-w-full min-w-0 overflow-hidden'
              >
                <ChatModelsList />
              </motion.div>
            )}
          </AnimatePresence>

          {provider.requiresApiKey && <ApiKeysForm />}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
