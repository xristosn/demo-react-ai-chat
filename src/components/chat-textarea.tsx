import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { SendHorizonal, StopCircleIcon } from 'lucide-react';

import { useAutosizeTextArea } from '@/hooks/use-textarea-autosize';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export type ChatTextareaRef = {
  textArea: HTMLTextAreaElement;
  maxHeight: number;
  minHeight: number;
};

export interface ChatTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
  minHeight?: number;
  value?: string;
  isGenerating?: boolean;
  onStop?: () => void;
  isDemo?: boolean;
}

export const ChatTextarea = forwardRef<ChatTextareaRef, ChatTextareaProps>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 52,
      className,
      onChange,
      value,
      disabled,
      isGenerating,
      children,
      onStop,
      isDemo,
      ...props
    }: ChatTextareaProps,
    ref: React.Ref<ChatTextareaRef>
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = useState('');
    const isMobile = useIsMobile();

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef?.current?.focus(),
      maxHeight,
      minHeight,
    }));

    useEffect(() => {
      setTriggerAutoSize(value as string);
    }, [props?.defaultValue, value]);

    return (
      <div className='flex flex-col gap-2 w-full rounded-lg border border-input dark:bg-neutral-900 bg-neutral-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
        <textarea
          placeholder='Ask anything'
          disabled={disabled}
          {...props}
          value={value}
          ref={textAreaRef}
          className={cn(
            'flex px-3 pt-2 text-md placeholder:text-muted-foreground outline-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            className
          )}
          onChange={(e) => {
            setTriggerAutoSize(e.target.value);
            onChange?.(e);
          }}
        />

        <div className='flex flex-row gap-2 p-2 items-center'>
          {children}

          {isGenerating ? (
            <Button
              size={isMobile ? 'icon-sm' : 'icon'}
              className='ml-auto not-disabled:cursor-pointer'
              onClick={onStop}
            >
              <StopCircleIcon />
            </Button>
          ) : (
            <Button
              type='submit'
              size={isMobile ? 'icon-sm' : 'icon'}
              className='ml-auto not-disabled:cursor-pointer'
              disabled={!isDemo && (disabled || isGenerating || !value?.trim())}
            >
              <SendHorizonal />
            </Button>
          )}
        </div>
      </div>
    );
  }
);
