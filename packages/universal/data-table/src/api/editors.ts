import type { FilterOption } from './filters.js';

export type { DateColumnEditorSettings, EditorProps, SelectColumnEditorSettings, TextColumnEditorSettings };

type EditorProps<Row> = {
  row: Row;
  draft: Row;
  columnKey: keyof Row & string;
  value: unknown;
  change: (patch: Partial<Row>) => void;
  labelledBy: string;
};

type TextColumnEditorSettings = { placeholder?: string };

type SelectColumnEditorSettings = { options: readonly FilterOption[] };

type DateColumnEditorSettings = { placeholder?: string };
