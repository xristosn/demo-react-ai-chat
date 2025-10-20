import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useWebStorage } from '@/hooks/use-web-storage';

import { DEFAULT_CHAT_SETTINGS, TEMPLATES } from '@/lib/constants';
import type { AiChat } from '@/lib/interfaces/ai-chat';
import type { ChatModel } from '@/lib/interfaces/chat-model';
import type { AiChatMessage, AiChatSystemMessage } from '@/lib/interfaces/ai-messages';
import { uuidv4 } from '@/lib/utils';
import type { Template } from '@/lib/interfaces/template';
import type { AiChatSettings } from '@/lib/interfaces/ai-chat-settings';

export interface ChatProviderState {
  models: ChatModel[];
  setModels: React.Dispatch<React.SetStateAction<ChatModel[]>>;

  activeChatId: string;
  setActiveChatId: React.Dispatch<React.SetStateAction<string>>;

  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;

  templateId: string;
  setTemplateId: React.Dispatch<React.SetStateAction<string>>;
}

const noFn = () => undefined;

const initialState: ChatProviderState = {
  models: [],
  setModels: noFn,

  activeChatId: '',
  setActiveChatId: noFn,

  isGenerating: false,
  setIsGenerating: noFn,

  templateId: '',
  setTemplateId: noFn,
};

const ChatProviderContext = createContext<ChatProviderState>(initialState as ChatProviderState);

export const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [models, setModels] = useState<ChatModel[]>(initialState.models || []);
  const [activeChatId, setActiveChatId] = useState(initialState.activeChatId);
  const [isGenerating, setIsGenerating] = useState(initialState.isGenerating);
  const [templateId, setTemplateId] = useState(initialState.templateId);

  return (
    <ChatProviderContext.Provider
      value={{
        models,
        setModels,

        activeChatId,
        setActiveChatId,

        isGenerating,
        setIsGenerating,

        templateId,
        setTemplateId,
      }}
    >
      {children}
    </ChatProviderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
  const context = useContext(ChatProviderContext);
  if (!ChatProviderContext) throw new Error('useChat must be used within a ChatProvider');

  const [chats, setChats, clearChats] = useWebStorage<AiChat[]>('chats', 'local', []);
  const [customTemplates, setCustomTemplates, clearTemplates] = useWebStorage<Template[]>(
    'templates',
    'local',
    []
  );
  const [settings, setSettings, clearSettings] = useWebStorage<AiChatSettings>(
    'settings',
    'local',
    DEFAULT_CHAT_SETTINGS
  );
  const [tools, setTools, clearTools] = useWebStorage<string[]>('tools', 'local', []);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === context.activeChatId),
    [chats, context.activeChatId]
  );

  const templates = useMemo(() => [...TEMPLATES, ...customTemplates], [customTemplates]);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === context.templateId),
    [context.templateId, templates]
  );

  const setActiveChatId = useCallback(
    (chatId: string) => {
      context.setActiveChatId(chatId || '');

      const url = new URL(window.location.href);

      if (chatId) {
        url.searchParams.set('chatId', chatId);
      } else {
        url.searchParams.delete('chatId');
      }

      window.history.replaceState({}, document.title, url.toString());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context.setActiveChatId]
  );

  const setTemplateId = useCallback(
    (templateId: string) => {
      if (activeChat?.templateId !== templateId) {
        setActiveChatId('');
      }

      context.setTemplateId(templateId);
    },
    [activeChat?.templateId, context, setActiveChatId]
  );

  const createChat = useCallback(
    (prompt: string) => {
      const title = prompt.length > 65 ? `${prompt.slice(0, 65)} ...` : prompt;

      const newChat: AiChat = {
        id: uuidv4(),
        messages: [
          activeTemplate &&
            ({
              id: uuidv4(),
              role: 'system',
              content: activeTemplate.system.replace('{date}', new Date().toISOString()),
            } as AiChatSystemMessage),
        ].filter(Boolean) as AiChatMessage[],
        title,
        created: new Date().getTime(),
        updated: new Date().getTime(),
        templateId: context.templateId,
      };

      setChats((p) => [...p, newChat].sort((a, b) => b.updated - a.updated));

      setActiveChatId(newChat.id);

      return newChat;
    },
    [activeTemplate, context.templateId, setActiveChatId, setChats]
  );

  const updateChat = useCallback(
    (
      chatId: string,
      valueOrFn: Partial<AiChat> | ((updates: Partial<AiChat>) => Partial<AiChat>)
    ) => {
      if (!chatId) return;

      setChats((previousChats) =>
        previousChats.map((chat) => {
          if (chatId !== chat.id) return chat;

          const newValue = typeof valueOrFn === 'function' ? valueOrFn(chat) : valueOrFn;

          return {
            ...chat,
            ...newValue,
            id: chat.id,
            updated: new Date().getTime(),
          };
        })
      );
    },
    [setChats]
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId));

      if (chatId === context.activeChatId) setActiveChatId('');
    },
    [context.activeChatId, setActiveChatId, setChats]
  );

  const setChatMessages = useCallback(
    (chatId: string, newMessages: AiChatMessage[]) => {
      updateChat(chatId, (prevChat) => ({
        ...prevChat,
        messages: newMessages || [],
      }));
    },
    [updateChat]
  );

  const createTemplate = useCallback(
    (name: string, description: string, system: string) => {
      const template: Template = {
        id: uuidv4(),
        name,
        description,
        system,
      };

      setCustomTemplates((t) => [...t, template]);

      return template;
    },
    [setCustomTemplates]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setCustomTemplates((templates) => templates.filter((t) => t.id !== id));
    },
    [setCustomTemplates]
  );

  const editTemplate = useCallback(
    (templateId: string, updates: Partial<Template>) => {
      setCustomTemplates((templates) =>
        templates.map((t) => {
          if (t.id !== templateId) return t;

          return {
            ...t,
            ...updates,
            id: t.id,
          };
        })
      );
    },
    [setCustomTemplates]
  );

  const clearData = useCallback(() => {
    clearChats();
    clearSettings();
    clearTemplates();
    clearTools();
  }, [clearChats, clearSettings, clearTemplates, clearTools]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('chatId')) {
      context.setActiveChatId(params.get('chatId') || '');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeChat) context.setTemplateId(activeChat?.templateId || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.templateId]);

  return {
    ...context,
    setActiveChatId,
    chats,
    activeChat,
    createChat,
    setChatMessages,
    updateChat,
    deleteChat,
    setTemplateId,
    activeTemplate,
    templates,
    createTemplate,
    deleteTemplate,
    editTemplate,
    settings,
    setSettings,
    clearData,
    tools,
    setTools,
  };
};
