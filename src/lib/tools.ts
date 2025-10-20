import * as z from 'zod';
import type { ChatToolConfig, ChatToolOptions } from './interfaces/tool';

function createAiChatTool<T extends z.ZodObject>({
  toolName,
  description,
  title,
  parameters,
  action,
}: ChatToolOptions<T>): ChatToolConfig<T> {
  return {
    config: {
      type: 'function',
      function: {
        name: toolName,
        description,
        parameters: z.toJSONSchema(parameters || z.object({})),
      },
    },
    name: toolName,
    title,
    action,
    parameters: parameters || (z.object({}) as unknown as T),
  };
}

export const chatToolDateTime = createAiChatTool({
  toolName: 'get_current_date_time',
  title: 'Current datetime',
  description: 'Returns the current date and time in various timezones',
  parameters: z.object({}),
  action() {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    return [
      `Local date is ${now.toLocaleString(undefined, options)}`,
      `UTC date is ${now.toLocaleString('en-US', { ...options, timeZone: 'UTC' })}`,
      `Western European Time (WET) is ${now.toLocaleString('en-GB', {
        ...options,
        timeZone: 'Europe/Lisbon',
      })}`,
      `Central European Time (CET) is ${now.toLocaleString('en-GB', {
        ...options,
        timeZone: 'Europe/Amsterdam',
      })}`,
      `Eastern European Time (EET) is ${now.toLocaleString('en-GB', {
        ...options,
        timeZone: 'Europe/Bucharest',
      })}`,
      `Eastern Standard Time (EST) is ${now.toLocaleString('en-US', {
        ...options,
        timeZone: 'America/New_York',
      })}`,
      `Central Standard Time (CST) is ${now.toLocaleString('en-US', {
        ...options,
        timeZone: 'America/Chicago',
      })}`,
      `Pacific Standard Time (PST) is ${now.toLocaleString('en-US', {
        ...options,
        timeZone: 'America/Los_Angeles',
      })}`,
    ].join('\n');
  },
});

export const chatToolInstantSearch = createAiChatTool({
  toolName: 'instant_search',
  title: 'Instant Search',
  description: `Fetches factual answers, summaries and related topics. Useful for quick lookups, definitions, and concise explanations. Not a full web search, returns only Instant Answer data.`,
  parameters: z.object({
    keyword: z
      .string()
      .describe('A single keyword describing the topic to fetch an instant answer for.'),
  }),
  async action(parameters, _, __, abortSignal) {
    if (abortSignal?.aborted) {
      return ``;
    }

    const keyword = parameters.keyword.split(' ')[0];

    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(
        keyword
      )}&format=json&pretty=1&no_html=1&skip_disambig=1`,
      {
        signal: abortSignal,
      }
    );

    const data = await res.json();

    console.log(data);

    return JSON.stringify(data, null, 2);
  },
});

export const chatToolWebSearch = createAiChatTool({
  toolName: 'web_search',
  title: 'Web Search',
  description:
    'Search the web for current information, news, or facts. Use this when you need up-to-date information that may have changed recently.',
  parameters: z.object({}),
  action: () => '',
});

export const CHAT_TOOLS = [chatToolDateTime, chatToolInstantSearch, chatToolWebSearch];
