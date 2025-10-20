import type * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar';

export interface ChatSidebarCollapsibleGroupProps
  extends React.PropsWithChildren,
    React.ComponentProps<typeof CollapsiblePrimitive.Root> {
  label: React.ReactNode;
}

export const ChatSidebarCollapsibleGroup: React.FC<ChatSidebarCollapsibleGroupProps> = ({
  label,
  children,
  ...collapsibleProps
}) => (
  <Collapsible className='group/collapsible' {...collapsibleProps}>
    <SidebarGroup>
      <SidebarGroupLabel className='flex gap-2' asChild>
        <CollapsibleTrigger>
          {label}

          <ChevronDown className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180' />
        </CollapsibleTrigger>
      </SidebarGroupLabel>

      <CollapsibleContent>
        <SidebarGroupContent>{children}</SidebarGroupContent>
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
);
