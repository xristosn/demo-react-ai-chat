import { useEffect, useState } from 'react';

import type { AiChatMessage } from '@/lib/interfaces/ai-messages';

export function useChatAutoscroll(
  chatRef: React.RefObject<HTMLDivElement | null>,
  messages: AiChatMessage[]
) {
  const [lastHeight, setLastHeight] = useState(NaN);

  const onScroll = () => {
    if (chatRef.current?.scrollTop === 0) {
      const { scrollHeight } = chatRef.current;

      setLastHeight(scrollHeight);
    }
  };

  useEffect(() => {
    if (!chatRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 150) {
      chatRef.current.scrollTop = scrollHeight;
      return;
    }

    if (!lastHeight) {
      chatRef.current.scrollTop = scrollHeight;
    } else {
      if (scrollTop === 0) {
        const diff = scrollHeight - lastHeight;
        chatRef.current.scrollTop = diff;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.map((m) => m.id + m.content).join(''), lastHeight]);

  return onScroll;
}
