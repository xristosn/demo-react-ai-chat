/// <reference types="vite-plugin-svgr/client" />

import { Presentation } from 'lucide-react';
import type { Model } from 'openai/resources';
import type { Page } from 'openai/pagination';

import OpenAILogo from '@/assets/icons/openai.svg?react';
import OpenRouterLogo from '@/assets/icons/open-router.svg?react';
import GroqLogo from '@/assets/icons/groq.svg?react';
import ClaudeLogo from '@/assets/icons/claude.svg?react';
import PerplexityLogo from '@/assets/icons/perplexity.svg?react';

import type { ChatModel } from './interfaces/chat-model';
import type { LLMProvider } from './interfaces/llm-provider';
import { DEMO_MOCK_RESPONSES } from './constants';

export const LLM_DEMO_PROVIDER_MODEL: ChatModel = {
  id: 'demo_model',
  name: 'Demo Model',
  created: new Date().getTime(),
  object: 'model',
  ownedBy: 'Demo',
  description: '',
};

export const LLM_DEMO_PROVIDER: LLMProvider = {
  id: 'demo',
  label: 'Demo',
  icon: Presentation,
  fetch: (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('/models')) {
      const body: Page<Model> = {
        object: 'list',
        data: [LLM_DEMO_PROVIDER_MODEL],
      } as unknown as Page<Model>;

      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json; charset=UTF-8' },
        })
      );
    }

    if (url.includes('/chat/completions')) {
      const body = JSON.parse((init?.body as string) || '{}') as {
        messages: { content: string; role: string }[];
      };
      const prompt = body.messages.find((m) => m.role === 'user')?.content || '';
      const content =
        DEMO_MOCK_RESPONSES.find((r) => r.prompt === prompt)?.content ||
        DEMO_MOCK_RESPONSES[0].content;

      const chunks: string[] = [];
      let i = 0;
      while (i < content.length) {
        const size = Math.floor(Math.random() * 6) + 1;
        chunks.push(content.slice(i, i + size));
        i += size;
      }

      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            if (init?.signal?.aborted) {
              break;
            }

            const sseEvent = `data: ${JSON.stringify({
              id: 'mock',
              object: 'chat.completion.chunk',
              choices: [{ delta: { content: chunk } }],
            })}\n\n`;

            controller.enqueue(encoder.encode(sseEvent));

            const delay = Math.floor(Math.random() * 5) + 1;

            await new Promise((r) => setTimeout(r, delay));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return Promise.resolve(
        new Response(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      );
    }

    return Promise.resolve(new Response(''));
  },
};

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    icon: OpenAILogo,
    requiresApiKey: true,
  },

  {
    id: 'claude',
    label: 'Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    icon: ClaudeLogo,
    requiresApiKey: true,
  },

  {
    id: 'open_router',
    label: 'Open Router',
    baseUrl: 'https://openrouter.ai/api/v1',
    icon: OpenRouterLogo,
    requiresApiKey: true,
  },

  {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    icon: GroqLogo,
    requiresApiKey: true,
  },

  {
    id: 'perplexity',
    label: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    icon: PerplexityLogo,
    requiresApiKey: true,
  },

  LLM_DEMO_PROVIDER,
];
