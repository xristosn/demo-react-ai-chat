import type * as z from 'zod';
import type { AiChatAssistantMessage, AiChatMessage, AiChatToolMessage } from './ai-messages';
import type { ChatCompletionFunctionTool } from 'openai/resources';

export interface ChatToolOptions<T extends z.ZodObject = z.ZodObject> {
  toolName: string;
  description: string;
  title?: string;
  parameters?: T;
  action: (
    parameters: z.infer<T>,
    assistantMessage: AiChatAssistantMessage,
    history: AiChatMessage[],
    abortSignal?: AbortSignal
  ) => Promise<AiChatToolMessage['content']> | AiChatToolMessage['content'];
}

export interface ChatToolConfig<T extends z.ZodObject = z.ZodObject> {
  config: ChatCompletionFunctionTool;
  name: string;
  title?: string;
  parameters: T;
  action: (
    parameters: z.infer<T>,
    assistantMessage: AiChatAssistantMessage,
    history: AiChatMessage[],
    abortSignal?: AbortSignal
  ) => Promise<AiChatToolMessage['content']> | AiChatToolMessage['content'];
}
