import { useCallback, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { useLLMProvider } from '@/hooks/use-llm-provider';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChat } from './chat-provider';

import type { LLMProvider } from '@/lib/interfaces/llm-provider';
import { getModels } from '@/lib/openai';

export const ApiKeysForm: React.FC = () => {
  const {
    providerId,
    providerApiKeys,
    provider,
    saveProviderKey,
    deleteProviderKey,
    apiKey,
    setApiKey,
  } = useLLMProvider();
  const { setModels } = useChat();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  const onSaveKey = useCallback(async () => {
    try {
      const res = await getModels(provider as LLMProvider, key);
      setModels(res);
    } catch (err) {
      console.error(err);
      toast.error('Could not validate API Key', {
        dismissible: true,
        description: (err as Error)?.message || '',
      });

      return;
    }

    saveProviderKey(providerId, name, key, true);

    setName('');
    setKey('');
  }, [key, name, provider, providerId, saveProviderKey, setModels]);

  const onDeleteKey = useCallback(() => {
    if (confirm('Are you sure you want to delete this api key?')) {
      deleteProviderKey(providerId, apiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, apiKey]);

  return (
    <div className='flex flex-col gap-4'>
      {!!providerApiKeys.length && (
        <motion.div layout initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Field>
            <div className='flex gap-2 justify-between'>
              <FieldLabel>API Key</FieldLabel>

              {apiKey && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs max-h-none text-muted-foreground'
                  onClick={onDeleteKey}
                >
                  Delete
                </Button>
              )}
            </div>

            <Select value={apiKey} onValueChange={(v) => setApiKey(v === 'none' ? '' : v)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Save a new API Key' />
              </SelectTrigger>

              <SelectContent>
                {providerApiKeys.map((apiKey) => (
                  <SelectItem key={apiKey.key} value={apiKey.key}>
                    {apiKey.name}
                  </SelectItem>
                ))}
                <SelectItem value='none'>Save a new API Key</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </motion.div>
      )}

      <AnimatePresence>
        {provider?.requiresApiKey && !apiKey && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className='flex flex-col gap-4 p-4 border rounded-sm'
          >
            <Field>
              <FieldDescription className='text-xs'>
                This provides requires an API Key
              </FieldDescription>

              <FieldLabel htmlFor='api-key-name' className='text-sm'>
                Name *
              </FieldLabel>

              <Input
                id='api-key-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='api-key' className='text-sm'>
                Key *
              </FieldLabel>

              <Input id='api-key' value={key} onChange={(e) => setKey(e.target.value)} required />
            </Field>

            <Button disabled={!name?.trim() || !key?.trim()} onClick={onSaveKey}>
              Save
            </Button>

            <p className='text-xs text-center text-muted-foreground'>
              All keys are saved locally on your browser
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
