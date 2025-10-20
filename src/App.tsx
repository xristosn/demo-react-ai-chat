import { useCallback, useEffect, useRef, useState } from 'react';

import { AlertTriangle, Github, Trash } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneDeep } from 'lodash-es';

import { useLLMProvider } from '@/hooks/use-llm-provider';
import { useChatAutoscroll } from '@/hooks/use-chat-autoscroll';

import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatTextarea } from '@/components/chat-textarea';
import { ProviderDialog } from '@/components/provider-dialog';
import { useChat } from '@/components/chat-provider';
import { UserMessage } from '@/components/chat-messages/user-message';
import { AssistantMessage } from '@/components/chat-messages/assistant-message';
import { Spinner } from '@/components/ui/spinner';
import { ChatInfo } from '@/components/chat-info';
import { Button } from '@/components/ui/button';
import { ToolsDialog } from '@/components/tools-dialog';

import type { AiChatUserMessage } from '@/lib/interfaces/ai-messages';
import { randomFromArray, uuidv4 } from '@/lib/utils';
import { startConversation, type ChatStream } from '@/lib/openai';
import { DEMO_MOCK_RESPONSES } from '@/lib/constants';
import { LLM_DEMO_PROVIDER, LLM_DEMO_PROVIDER_MODEL } from '@/lib/chat-providers';

export const App: React.FC = () => {
  const { providerError, provider, model, apiKey } = useLLMProvider();
  const {
    activeChat,
    createChat,
    isGenerating,
    setIsGenerating,
    setChatMessages,
    deleteChat,
    activeTemplate,
    setTemplateId,
    settings,
    tools,
  } = useChat();
  const [prompt, setPrompt] = useState('');
  const abortControllerRef = useRef<AbortController>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const onChatScroll = useChatAutoscroll(chatRef, activeChat?.messages || []);

  const handleConversation = useCallback(
    async (chatId: string, stream: ChatStream) => {
      setIsGenerating(true);

      for await (const { message, history, done } of stream) {
        if (done) {
          setChatMessages(chatId, history);
          break;
        } else {
          setChatMessages(chatId, [...history.filter((m) => m.id !== message.id), message]);
        }
      }

      abortControllerRef.current = null;

      setIsGenerating(false);
    },
    [setChatMessages, setIsGenerating]
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isGenerating || providerError || !prompt?.trim()) return;

      let chatId = activeChat?.id || '';
      let messages;

      if (!activeChat?.id) {
        const { id, messages: newChatMessages } = createChat(prompt);
        chatId = id;
        messages = newChatMessages;
      }

      const userMessage: AiChatUserMessage = {
        id: uuidv4(),
        role: 'user',
        content: prompt,
      };

      setPrompt('');

      abortControllerRef.current = new AbortController();

      const stream = startConversation(
        userMessage,
        messages || activeChat?.messages || [],
        provider,
        model?.id || '',
        apiKey,
        abortControllerRef.current.signal,
        settings,
        tools
      );

      await handleConversation(chatId, stream);
    },
    [
      activeChat?.id,
      activeChat?.messages,
      apiKey,
      createChat,
      handleConversation,
      isGenerating,
      model?.id,
      prompt,
      provider,
      providerError,
      settings,
      tools,
    ]
  );

  const onKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        onSubmit(e);
      }
    },
    [onSubmit]
  );

  const onStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const onRegenarate = useCallback(
    async (userMessageId: string) => {
      if (!activeChat || !userMessageId) return;

      const userMessageIdx = activeChat.messages.findIndex(
        (m) => m.id === userMessageId && m.role === 'user'
      );

      const userMessage = cloneDeep(activeChat.messages[userMessageIdx]) as AiChatUserMessage;
      const newHistory = activeChat.messages.slice(0, userMessageIdx);

      setChatMessages(activeChat.id, newHistory);

      abortControllerRef.current = new AbortController();

      const stream = startConversation(
        userMessage,
        newHistory,
        provider,
        model?.id || '',
        apiKey,
        abortControllerRef.current.signal,
        settings,
        tools
      );

      await handleConversation(activeChat.id, stream);
    },
    [activeChat, apiKey, handleConversation, model?.id, provider, setChatMessages, settings, tools]
  );

  useEffect(() => {
    if (model?.id === LLM_DEMO_PROVIDER_MODEL.id) {
      if (!activeChat?.id) {
        setPrompt(randomFromArray(DEMO_MOCK_RESPONSES).prompt);
      } else {
        setPrompt('');
      }
    }
  }, [model, activeChat?.id]);

  return (
    <>
      <ChatSidebar />

      <main className='flex flex-col w-full justify-center h-[100vh] overflow-hidden'>
        <AnimatePresence>
          {!activeChat && (
            <motion.div
              className='absolute top-2 right-2'
              exit={{ filter: 'blur(10px)', scale: 0 }}
              transition={{ delay: 0.25, duration: 0.25 }}
            >
              <Button asChild size='icon' variant='ghost'>
                <a href='https://github.com/xristosn/demo-react-ai-chat' target='_blank'>
                  <Github />
                </a>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeChat && (
            <motion.div
              ref={chatRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100%' }}
              transition={{ delay: 0.25, duration: 0.25 }}
              className='overflow-y-auto max-h-full'
              onScroll={onChatScroll}
            >
              <div className='container mx-auto pt-4 px-4 md:px-8 flex flex-col gap-4'>
                <ChatInfo
                  chat={activeChat}
                  isGenerating={isGenerating}
                  onDelete={() => deleteChat(activeChat.id)}
                />

                {activeChat.messages.map((msg, idx) => {
                  const isLast = activeChat.messages.length - 1 === idx;

                  if (msg.role === 'user') {
                    return <UserMessage key={msg.id} {...msg} />;
                  }

                  if (msg.role === 'assistant' && !msg.tool_calls?.length) {
                    return (
                      <AssistantMessage
                        key={msg.id}
                        {...msg}
                        isLast={isLast}
                        isGenerating={isGenerating}
                        onRegenarate={() => onRegenarate(msg.userMessageId || '')}
                      />
                    );
                  }

                  return null;
                })}

                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      exit={{ scale: 0 }}
                      className='flex items-center justify-center h-8 overflow-hidden'
                    >
                      <Spinner className='size-5' />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!activeChat && (
            <motion.h1
              initial={{ scale: 0, filter: 'blur(5px)' }}
              animate={{ scale: 1, filter: 'none' }}
              exit={{ filter: 'blur(10px)' }}
              transition={{ duration: 0.25 }}
              className='text-4xl text-center dark:text-neutral-200 text-neutral-800 mb-4'
            >
              AI Chatbot
            </motion.h1>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ filter: 'blur(10px)' }}
          transition={{ duration: 0.25 }}
          className='container p-4 max-w-3xl mx-auto'
          onSubmit={onSubmit}
          onKeyDown={onKeydown}
        >
          <ChatTextarea
            minHeight={52}
            maxHeight={200}
            disabled={!!providerError || model?.id === LLM_DEMO_PROVIDER_MODEL.id}
            isGenerating={isGenerating}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onStop={onStop}
            isDemo={!activeChat && model?.id === LLM_DEMO_PROVIDER_MODEL.id}
          >
            <ProviderDialog />

            <ToolsDialog />

            {activeTemplate && (
              <Button
                variant='outline'
                size='default'
                onClick={() => !activeChat && setTemplateId('')}
              >
                {activeTemplate.name} {!activeChat && <Trash />}
              </Button>
            )}
          </ChatTextarea>

          {providerError && (
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='mt-2 py-2 px-4 border rounded-md dark:bg-neutral-900 bg-neutral-100 text-red-400 flex gap-4'
            >
              <AlertTriangle /> {providerError}
            </motion.p>
          )}

          {model?.id === LLM_DEMO_PROVIDER_MODEL.id && (
            <p className='flex gap-4 mt-2 py-2 px-4 border rounded-md dark:bg-neutral-900 bg-neutral-100 text-xs sm:text-sm'>
              <LLM_DEMO_PROVIDER.icon />
              This is a demo {activeChat?.id ? 'model' : 'prompt'} designed to showcase how chat and
              streaming functionality work. For a real experience, try selecting a different
              provider and model.
            </p>
          )}
        </motion.form>
      </main>
    </>
  );
};

