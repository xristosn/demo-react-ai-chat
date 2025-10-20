import {
  type ChatCompletionAssistantMessageParam,
  type ChatCompletionDeveloperMessageParam,
  type ChatCompletionSystemMessageParam,
  type ChatCompletionToolMessageParam,
  type ChatCompletionUserMessageParam,
} from 'openai/resources';

interface AiChatCommonMessage {
  id: string;
  error?: boolean;
  aborted?: boolean;
  sources?: { title: string; url: string; favicon: string }[];
}

interface AiChatResponseMessage {
  userMessageId?: string;
}

export type AiChatSystemMessage = AiChatCommonMessage & ChatCompletionSystemMessageParam;

export type AiChatUserMessage = AiChatCommonMessage & ChatCompletionUserMessageParam;

export type AiChatAssistantMessage = AiChatCommonMessage &
  AiChatResponseMessage &
  ChatCompletionAssistantMessageParam;

export type AiChatToolMessage = AiChatCommonMessage &
  AiChatResponseMessage &
  ChatCompletionToolMessageParam;

export type AiChatDeveloperMessage = AiChatCommonMessage &
  AiChatResponseMessage &
  ChatCompletionDeveloperMessageParam;

export type AiChatMessage =
  | AiChatSystemMessage
  | AiChatUserMessage
  | AiChatAssistantMessage
  | AiChatToolMessage
  | AiChatDeveloperMessage;
