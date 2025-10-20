import { Info, Settings } from 'lucide-react';

import { useChat } from './chat-provider';
import { useLLMProvider } from '@/hooks/use-llm-provider';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { AiChatSettings } from '@/lib/interfaces/ai-chat-settings';
import { DEFAULT_CHAT_SETTINGS } from '@/lib/constants';
import { useCallback } from 'react';

export interface SettingsDialogProps {
  sidebarOpen: boolean;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ sidebarOpen }) => {
  const { settings, setSettings, clearData, setActiveChatId } = useChat();
  const { clearData: clearProviderData } = useLLMProvider();

  const onSettingChange = useCallback(
    <Prop extends keyof AiChatSettings>(key: Prop, value: AiChatSettings[Prop]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const onClearData = () => {
    if (confirm('Are you sure you want to clear all saved data?\n(This action is irreversible)')) {
      setActiveChatId('');
      clearData();
      clearProviderData();
      window.location.reload();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={sidebarOpen ? 'ghost' : 'outline'}
          size={sidebarOpen ? 'default' : 'icon'}
          className='mr-auto'
        >
          <Settings />

          {sidebarOpen && 'Settings'}
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <Field>
            <div className='flex gap-2'>
              <FieldLabel htmlFor='settings-temperature'>Temperature</FieldLabel>

              <Tooltip>
                <TooltipTrigger>
                  <Info className='size-4' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>How wiggly the AI’s answers are. </p>
                  <p>Low temperature → answers are straight and serious,</p>
                  <p>High temperature → answers get more random, fun, and surprising.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Input
              id='settings-temperature'
              value={settings.temperature}
              onChange={(e) => {
                const v = Number(Number(e.target.value)?.toFixed?.(2));

                if (isNaN(v)) onSettingChange('temperature', DEFAULT_CHAT_SETTINGS.temperature);
                else if (v < 0) onSettingChange('temperature', 0);
                else if (v > 1) onSettingChange('temperature', 1);
                else onSettingChange('temperature', v);
              }}
              type='number'
              min={0}
              max={1.0}
              step={0.1}
            />
          </Field>

          <p className='text-center text-muted-foreground text-sm'>
            Some models may not support all of the settings above.
          </p>

          <Separator />

          <Button onClick={onClearData}>Clear all saved data</Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
