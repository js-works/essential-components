export type { AutocompleteColumnFilterSettings, AutocompleteOption };

type AutocompleteOption = { value: string; label: string; content?: () => string | Node };

type AutocompleteColumnFilterSettings = {
  load: (query: string, signal: AbortSignal) => Promise<readonly AutocompleteOption[]>;
  multiple?: boolean;
  minQueryLength?: number;
  maxChips?: number;
};
