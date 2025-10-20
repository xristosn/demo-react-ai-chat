import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Ellipsis } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from './chat-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Template } from '@/lib/interfaces/template';
import { cn } from '@/lib/utils';

export const ChatSidebarTemplates: React.FC = () => {
  const { createTemplate, deleteTemplate, templates, templateId, setTemplateId, editTemplate } =
    useChat();
  const [id, setId] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState('');

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formEl = e.target as HTMLFormElement;

      if (!formEl.reportValidity?.()) {
        return;
      }

      if (id) {
        editTemplate(id, { name, description, system });

        toast.info(`Template "${name}" edited`);
      } else {
        createTemplate(name, description, system);

        toast.info(`Template "${name}" created`);
      }

      setOpen(false);
    },
    [createTemplate, description, editTemplate, id, name, system]
  );

  const onDeleteTemplate = useCallback(
    (templateId: string) => {
      if (confirm('Are you sure you want to delete this template?')) {
        deleteTemplate(templateId);
      }
    },
    [deleteTemplate]
  );

  const onEditTemplate = useCallback((template: Template) => {
    setId(template.id);
    setName(template.name);
    setDescription(template.description);
    setSystem(template.system);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setId('');
      setName('');
      setDescription('');
      setSystem('');
    }
  }, [open]);

  return (
    <>
      {templates.map((template) => (
        <div
          className='group/template-item relative max-w-full min-w-0 overflow-hidden'
          key={template.id}
        >
          <Button
            size='sm'
            variant={templateId === template.id ? 'outline' : 'ghost'}
            className={cn(
              'w-full items-start flex-col gap-1 whitespace-normal text-left text-ellipsis mb-2 pr-8',
              template.description && 'h-auto justify-start'
            )}
            onClick={() => setTemplateId(template.id)}
          >
            {template.name}

            {template.description && (
              <span className='text-xs text-muted-foreground'>{template.description}</span>
            )}
          </Button>

          {!template.preset && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon-sm'
                  className='absolute top-1 right-1 size-6 md:opacity-0 group-hover/template-item:opacity-100 hover:opacity-100 active:opacity-100 data-[state=open]:opacity-100'
                >
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onEditTemplate(template)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteTemplate(template.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}

      <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
        <div className='flex justify-center'>
          <DialogTrigger asChild>
            <Button size='sm' variant='outline' className='mx-auto'>
              New Template
            </Button>
          </DialogTrigger>
        </div>

        <DialogPortal>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new Template</DialogTitle>
            </DialogHeader>

            <form className='flex flex-col gap-4 max-w-full w-full min-w-0' onSubmit={onSubmit}>
              <Field>
                <FieldLabel htmlFor='template-name'>Name *</FieldLabel>
                <Input
                  id='template-name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={40}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='template-description'>Description</FieldLabel>
                <Textarea
                  id='template-description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                  className='max-h-40'
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='template-system'>Content *</FieldLabel>
                <Textarea
                  id='template-system'
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  maxLength={1500}
                  required
                  className='max-h-80'
                />
                <p className='text-xs text-muted-foreground'>
                  For better results, be sure to specify that responses should be formatted in
                  Markdown.
                </p>
              </Field>

              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant='ghost'>Cancel</Button>
                </DialogTrigger>

                <Button type='submit'>{id ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};
