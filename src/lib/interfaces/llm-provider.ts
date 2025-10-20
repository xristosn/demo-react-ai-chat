import type { Fetch } from "node_modules/openai/internal/builtin-types.d.mts";

export interface LLMProvider {
  id: string;
  label: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  baseUrl?: string;
  requiresApiKey?: boolean;
  fetch?: Fetch;
}
