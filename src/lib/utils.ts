import { clsx, type ClassValue } from 'clsx';
import type OpenAI from 'openai';
import { twMerge } from 'tailwind-merge';

import type { ChatModel } from './interfaces/chat-model';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function stringIncludes(str: string, included: string) {
  return (
    str && included && typeof str === 'string' && str.toLowerCase().includes(included.toLowerCase())
  );
}

export function isValidChatModel(model: OpenAI.Models.Model & Record<string, unknown>) {
  const id = model.id;
  const name = (model.name || model.display_name) as string;
  const slug = (model.slug || model.canonical_slug) as string;

  if (id && stringIncludes(id, 'embedding')) return false;
  if (name && stringIncludes(name, 'embedding')) return false;
  if (slug && stringIncludes(slug, 'embedding')) return false;

  if (id && stringIncludes(id, 'fine-tune')) return false;
  if (name && stringIncludes(name, 'fine-tune')) return false;
  if (slug && stringIncludes(slug, 'fine-tune')) return false;

  if (id && stringIncludes(id, '-exp')) return false;
  if (name && stringIncludes(name, '-exp')) return false;
  if (slug && stringIncludes(slug, '-exp')) return false;

  const isActive = typeof model.active === 'boolean' ? model.active : true;
  if (!isActive) return false;

  const architecture = (model.architecture || {}) as { output_modalities: string[] };
  if (
    Array.isArray(architecture.output_modalities) &&
    !architecture.output_modalities.includes('text')
  )
    return false;

  return true;
}

export function openAiModelToChatModel(
  model: OpenAI.Models.Model & Record<string, unknown>
): ChatModel {
  const id = (model.id || model.slug || model.canonical_slug) as string;

  return {
    id,
    name: (model.name || model.display_name) as string,
    created: model.created,
    object: model.object,
    ownedBy: model.owned_by || (model.ownedBy as string),
    description: (model.description as string) || '',
  };
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function timeAgo(timestamp: number) {
  const now = Date.now();
  const diffMs = now - timestamp;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) {
    return `under a minute ago`;
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
}

export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

