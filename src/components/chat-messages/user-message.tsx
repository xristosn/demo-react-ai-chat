import { Markdown } from '../markdown';

import type { AiChatUserMessage } from '@/lib/interfaces/ai-messages';

export const UserMessage: React.FC<AiChatUserMessage> = ({ content }) => (
  <div className='flex gap-4 justify-end items-start'>
    <div className='flex flex-col gap-2 p-2 max-w-[75%] rounded-sm bg-muted'>
      <Markdown content={content.toString()} />
    </div>
  </div>
);
