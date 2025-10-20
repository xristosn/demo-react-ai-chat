import { useMemo } from 'react';

import { Bot, Plus, Clock, BookTemplate, MessagesSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './mode-toggle';
import { ChatSidebarCollapsibleGroup } from './chat-sidebar-collapsible-group';
import { useChat } from './chat-provider';
import { ChatSidebarChatItem } from './chat-sidebar-chat-item';
import { ChatSidebarTemplates } from './chat-sidebar-templates';
import { SettingsDialog } from './settings-dialog';

import { cn } from '@/lib/utils';

export const ChatSidebar: React.FC = () => {
  const { open, openMobile } = useSidebar();
  const { chats, activeChatId, setActiveChatId, isGenerating, updateChat, deleteChat } = useChat();

  const recentChats = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return chats.filter((c) => c.updated >= sevenDaysAgo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats.map((c) => c.updated).join('')]);

  const isOpen = open || openMobile;

  return (
    <>
      <Sidebar collapsible='icon'>
        <SidebarHeader className='flex flex-row gap-2 items-center whitespace-nowrap'>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                exit={{ translateX: '-50%', opacity: 0 }}
                transition={{ duration: 0.1 }}
                className='flex flex-row gap-2'
              >
                <Bot /> {isOpen ? 'AI Chatbot' : ''}
              </motion.span>
            )}
          </AnimatePresence>

          <SidebarTrigger className='size-9 ml-auto' variant='outline' />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <Button
              className={cn(isOpen ? 'rounded-xl' : 'rounded-full')}
              size={isOpen ? 'default' : 'icon'}
              onClick={() => setActiveChatId('')}
              disabled={isGenerating}
            >
              <Plus />{' '}
              <AnimatePresence>
                {isOpen && (
                  <motion.span exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                    Start a new chat
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </SidebarGroup>

          <AnimatePresence>
            {isOpen && (
              <motion.div exit={{ translateX: '-50%', opacity: 0 }} transition={{ duration: 0.1 }}>
                {!!recentChats.length && (
                  <ChatSidebarCollapsibleGroup
                    label={
                      <>
                        <Clock />
                        Recent
                      </>
                    }
                    defaultOpen
                  >
                    <div className='flex flex-col gap-2'>
                      {recentChats.map((chat) => (
                        <ChatSidebarChatItem
                          key={chat.id}
                          chat={chat}
                          isActive={activeChatId === chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                          deleteChat={() => deleteChat(chat.id)}
                          updateChat={(updates) => updateChat(chat.id, updates)}
                        />
                      ))}
                    </div>
                  </ChatSidebarCollapsibleGroup>
                )}

                {!!chats.length && (
                  <ChatSidebarCollapsibleGroup
                    label={
                      <>
                        <MessagesSquare />
                        Chats
                      </>
                    }
                    defaultOpen={!recentChats.length}
                  >
                    {chats.map((chat) => (
                      <ChatSidebarChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={activeChatId === chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        deleteChat={() => deleteChat(chat.id)}
                        updateChat={(updates) => updateChat(chat.id, updates)}
                      />
                    ))}
                  </ChatSidebarCollapsibleGroup>
                )}

                <ChatSidebarCollapsibleGroup
                  label={
                    <>
                      <BookTemplate />
                      Templates
                    </>
                  }
                >
                  <ChatSidebarTemplates />
                </ChatSidebarCollapsibleGroup>
              </motion.div>
            )}
          </AnimatePresence>
        </SidebarContent>

        <SidebarFooter className='border-t dark:border-neutral-700 border-neutral-200'>
          <div className={cn('flex gap-2', !isOpen && 'flex-col')}>
            <SettingsDialog sidebarOpen={isOpen} />

            <ModeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarTrigger className='size-9 fixed top-2 left-2' variant='outline' />
    </>
  );
};
