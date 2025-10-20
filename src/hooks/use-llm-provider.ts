import { useCallback, useMemo } from 'react';

import { useChat } from '@/components/chat-provider';
import { useWebStorage } from './use-web-storage';

import type { APIKey } from '@/lib/interfaces/api-key';
import type { ChatModel } from '@/lib/interfaces/chat-model';
import { LLM_DEMO_PROVIDER, LLM_DEMO_PROVIDER_MODEL, LLM_PROVIDERS } from '@/lib/chat-providers';

export interface LLMProviderState {
  providerId: string;
  model: ChatModel | undefined;
  apiKey: string;

  apiKeysPerProvider: Record<string, APIKey[]>;
}

export function useLLMProvider() {
  const [data, setData, clearData] = useWebStorage<LLMProviderState>('llm-provider', 'local', {
    providerId: LLM_DEMO_PROVIDER.id,
    model: LLM_DEMO_PROVIDER_MODEL,
    apiKey: '',
    apiKeysPerProvider: {},
  });
  const { setModels } = useChat();

  const provider = useMemo(
    () => LLM_PROVIDERS.find((p) => p.id === data.providerId) || LLM_DEMO_PROVIDER,
    [data.providerId]
  );

  const providerApiKeys = useMemo(
    () => data.apiKeysPerProvider[data.providerId] ?? [],
    [data.apiKeysPerProvider, data.providerId]
  );

  const setProvider = useCallback(
    (providerId: string) => {
      if (data.providerId === providerId) return;

      setModels([]);
      setData((d) => ({ ...d, providerId, model: undefined, apiKey: '' }));
    },
    [data.providerId, setData, setModels]
  );

  const setApiKey = (key: string) => {
    setData((d) => ({ ...d, apiKey: key }));
  };

  const saveProviderKey = (providerId: string, name: string, key: string, enableKey = false) => {
    setData((d) => ({
      ...d,

      ...(enableKey ? { apiKey: key } : {}),

      apiKeysPerProvider: {
        ...d.apiKeysPerProvider,
        [providerId]: [
          ...(d.apiKeysPerProvider[providerId] || []),
          { key, name, created: new Date().toISOString() },
        ],
      },
    }));
  };

  const deleteProviderKey = (providerId: string, key: string) => {
    setData((d) => ({
      ...d,

      apiKey: '',

      apiKeysPerProvider: {
        ...d.apiKeysPerProvider,
        [providerId]: (d.apiKeysPerProvider[providerId] || []).filter((k) => k.key !== key),
      },
    }));
  };

  const setModel = (model: ChatModel) => {
    setData((d) => ({ ...d, model }));
  };

  const providerError = useMemo(() => {
    if (!provider?.id) return 'No provider selected';

    if (provider.requiresApiKey && !data.apiKey) return 'No API key provided';

    if (!data.model?.id) return 'No Chat Model selected';

    return undefined;
  }, [provider?.id, provider?.requiresApiKey, data.apiKey, data.model?.id]);

  return {
    ...data,
    provider,
    setProvider,
    providerApiKeys,
    saveProviderKey,
    deleteProviderKey,
    setApiKey,
    setModel,
    setData,
    providerError,
    clearData,
  };
}
