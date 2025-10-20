import type { AiChatMessage } from './ai-messages';

export interface AiChat {
  id: string;
  title: string;
  created: number;
  updated: number;
  messages: AiChatMessage[];
  templateId?: string;
}
