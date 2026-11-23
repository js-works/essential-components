export type { AutocompleteFilterSettings, AutocompleteOption };

type AutocompleteOption = { value: string; label: string; content?: () => string | Node };

type AutocompleteFilterSettings = {
  load: (query: string, signal: AbortSignal) => Promise<readonly AutocompleteOption[]>;
  multiple?: boolean;
  minQueryLength?: number;
  maxChips?: number;
};
