import { OpenAI } from 'openai';
import type {
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  Model,
} from 'openai/resources';
import { cloneDeep, omit } from 'lodash-es';

import type { LLMProvider } from './interfaces/llm-provider';
import { isValidChatModel, openAiModelToChatModel, uuidv4 } from './utils';

import type {
  AiChatAssistantMessage,
  AiChatMessage,
  AiChatToolMessage,
  AiChatUserMessage,
} from './interfaces/ai-messages';
import type { AiChatSettings } from './interfaces/ai-chat-settings';
import { CHAT_TOOLS, chatToolWebSearch } from './tools';
import type { ChatToolConfig } from './interfaces/tool';

export async function getModels(provider: LLMProvider, apiKey?: string) {
  const api = new OpenAI({
    baseURL: provider.baseUrl,
    apiKey: apiKey || '',
    dangerouslyAllowBrowser: true,
    fetch: provider.fetch || window.fetch,
  });

  return (await api.models.list()).data
    .filter((m) => isValidChatModel(m as Model & Record<string, unknown>))
    .map((m) => openAiModelToChatModel(m as Model & Record<string, unknown>));
}

export type ChatStream = AsyncGenerator<
  {
    history: AiChatMessage[];
    message: AiChatAssistantMessage;
    done: boolean;
  },
  {
    history: AiChatMessage[];
    message: AiChatAssistantMessage;
    done: boolean;
  },
  undefined
>;

export async function* startConversation(
  userMessage: AiChatUserMessage,
  previousMessages: AiChatMessage[],
  provider: LLMProvider,
  model: string,
  apiKey: string,
  abortSignal: AbortSignal,
  settings: AiChatSettings,
  toolNames: string[] = [],
  maxChatIterations = 5
): ChatStream {
  const tools = toolNames
    .map((name) => CHAT_TOOLS.find((tool) => tool.name === name))
    .filter(Boolean) as ChatToolConfig[];

  const API = new OpenAI({
    baseURL: provider.baseUrl,
    apiKey: apiKey || '',
    dangerouslyAllowBrowser: true,
    fetch: provider.fetch || window.fetch,
  });

  let error: Error | undefined = undefined;
  let hasFinished = false;
  let onAbort = () => {};

  const assistantMessage: AiChatAssistantMessage = {
    id: uuidv4(),
    userMessageId: userMessage.id,
    content: '',
    role: 'assistant',
    sources: [],
  };
  const toolsQueue: (ChatCompletionMessageFunctionToolCall & { completed?: boolean })[] = [];
  const history = [...(previousMessages || []), userMessage];

  const getResult = (notifyToFinish: boolean = false) => {
    if (notifyToFinish && !hasFinished) {
      hasFinished = true;

      if (abortSignal.aborted) {
        assistantMessage.aborted = true;
      }

      history.push(assistantMessage);

      if (error) {
        const msg =
          (error instanceof Error ? error.message : (error as { message: string })?.message) ||
          (error as unknown as string)?.toString() ||
          JSON.stringify(error);

        history.push({
          id: uuidv4(),
          role: 'assistant',
          userMessageId: userMessage.id,
          content: `
#### An error has occured during chat completions:
\`\`\`
${msg}
\`\`\``,
          error: true,
        });
      }
    }

    return {
      history,
      message: assistantMessage,
      done: notifyToFinish || false,
    };
  };

  yield getResult();

  for (let iteration = 0; iteration < maxChatIterations; iteration++) {
    try {
      if (provider.requiresApiKey && !apiKey)
        throw new Error((error as Error)?.message ?? 'Chat apiKey is empty');

      const stream = await API.chat.completions.create({
        model,
        messages: cloneDeep(history).map((msg) =>
          omit(msg, ['id', 'sources', 'error', 'userMessageId', 'aborted'])
        ) as ChatCompletionMessageParam[],
        stream: true,
        temperature: settings.temperature,
        tool_choice: 'auto',
        tools: tools.map((t) => {
          if (t.name === chatToolWebSearch.name) {
            return { type: 'web_search' };
          }

          return t.config;
        }) as ChatCompletionTool[],
        parallel_tool_calls: false,
      });

      if (abortSignal) {
        abortSignal.removeEventListener('abort', onAbort);

        if (abortSignal.aborted) {
          yield getResult(true);
          return getResult(true);
        }

        onAbort = () => stream.controller.abort();

        abortSignal.addEventListener('abort', () => stream.controller.abort());
      }

      yield getResult();

      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta;

        if (delta.content) {
          assistantMessage.content += delta.content;

          yield getResult();
        }

        if (delta.tool_calls?.length) {
          const currentToolsQueue: ChatCompletionMessageFunctionToolCall[] = [];

          for (const toolCall of delta.tool_calls) {
            if (typeof toolCall.index === 'number') {
              if (!currentToolsQueue[toolCall.index]) {
                currentToolsQueue[toolCall.index] = {
                  id: '',
                  type: 'function',
                  function: { arguments: '', name: '' },
                };
              }

              if (toolCall.id) currentToolsQueue[toolCall.index].id = toolCall.id;

              if (toolCall.function?.name)
                currentToolsQueue[toolCall.index].function.name += toolCall.function.name;

              if (toolCall.function?.arguments)
                currentToolsQueue[toolCall.index].function.arguments += toolCall.function.arguments;
            } else {
              currentToolsQueue.push({
                id: toolCall.id as string,
                function: {
                  name: toolCall.function?.name || '',
                  arguments: toolCall.function?.arguments || '',
                },
                type: 'function',
              });
            }
          }

          toolsQueue.push(...currentToolsQueue);
        }
      }

      // If no tool calls, we're done
      if (abortSignal?.aborted || !toolsQueue.filter((t) => t && !t.completed).length) {
        yield getResult(true);
        return getResult(true);
      }

      // Add assistant message with tool request calls to history
      history.push({
        id: uuidv4(),
        userMessageId: userMessage.id,
        role: 'assistant',
        content: assistantMessage.content || null,
        tool_calls: toolsQueue,
      });

      let toolCallIdx = 0;
      for (const toolCall of toolsQueue) {
        if (abortSignal?.aborted) {
          yield getResult(true);
          return getResult(true);
        }

        if (!toolCall.completed) {
          const tool = tools.find((t) => t.name === toolCall.function.name);

          if (tool) {
            const args = JSON.parse(toolCall.function.arguments);

            if (tool.parameters.safeParse(args).success) {
              yield getResult();

              const toolResult = await tool.action(args, assistantMessage, history);

              if (abortSignal?.aborted) {
                yield getResult(true);
                return getResult(true);
              }

              history.push({
                id: uuidv4(),
                userMessageId: userMessage.id,
                role: 'tool',
                tool_call_id: toolCall.id,
                content: toolResult as unknown as AiChatToolMessage['content'],
              });

              yield getResult();

              toolsQueue[toolCallIdx].completed = true;
            } else {
              console.error('Failed to properly parse tool parameters', tool);
            }
          }
        }

        toolCallIdx++;
      }

      error = undefined;
    } catch (err) {
      console.error(err);
      error = err as Error;

      if (err instanceof OpenAI.APIError) {
        if (err.status === 429) {
          yield getResult(true);
          return getResult(true);
        }
      }
    }
  }

  if (abortSignal) {
    abortSignal.removeEventListener('abort', onAbort);
  }

  yield getResult(true);
  return getResult(true);
}
