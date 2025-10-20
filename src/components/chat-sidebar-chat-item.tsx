import { useCallback, useState } from 'react';

import { Ellipsis } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { AiChat } from '@/lib/interfaces/ai-chat';

export interface ChatSidebarChatItemProps {
  chat: AiChat;
  isActive: boolean;
  onClick: () => void;
  updateChat: (updates: Partial<AiChat>) => void;
  deleteChat: () => void;
}

export const ChatSidebarChatItem: React.FC<ChatSidebarChatItemProps> = ({
  chat,
  isActive,
  onClick,
  deleteChat,
  updateChat,
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(chat.title);

  const onDeleteChat = useCallback(() => {
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat();
    }
  }, [deleteChat]);

  const onUpdateTitle = useCallback(() => {
    updateChat({ title });
    setOpen(false);
  }, [title, updateChat]);

  return (
    <div className='relative group/chat-item' role='group'>
      <DropdownMenu>
        <Button
          size='sm'
          variant={isActive ? 'outline' : 'ghost'}
          className='w-full justify-start max-w-full pr-8'
          onClick={onClick}
          title={chat.title}
        >
          <span className='block overflow-hidden'>{chat.title}</span>
        </Button>

        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='icon-sm'
            className='absolute top-1 right-1 size-6 md:opacity-0 group-hover/chat-item:opacity-100 hover:opacity-100 active:opacity-100 data-[state=open]:opacity-100'
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setOpen(true)}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteChat}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogPortal>
          <DialogContent className='w-full lg:max-w-xl'>
            <DialogHeader>
              <DialogTitle>Rename</DialogTitle>
            </DialogHeader>

            <Field>
              <FieldLabel htmlFor='rename-input'>Title</FieldLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <DialogFooter>
              <Button variant='ghost' onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button onClick={onUpdateTitle}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};
