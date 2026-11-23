import type { InputWrapperProps, MantineRadius, MantineSize } from '@mantine/core';

export type { MentionOption, RichTextEditorProps, RichTextFormat, RichTextMentions, RichTextProps };

type RichTextFormat = 'blocknote' | 'html' | 'markdown';

type MentionOption = { id: string; label: string };

type RichTextMentions = {
  suggest: (query: string) => readonly MentionOption[] | Promise<readonly MentionOption[]>;
  labelOf: (id: string) => string;
  hrefOf?: (id: string) => string | undefined;
  onOpen?: (id: string) => void;
};

type RichTextEditorProps = Omit<InputWrapperProps, 'children' | 'onChange' | 'size'> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  format?: RichTextFormat;
  mentions?: RichTextMentions;
  uploadFile?: (file: File) => Promise<string>;
  placeholder?: string;
  size?: MantineSize;
  radius?: MantineRadius;
  variant?: 'default' | 'filled' | 'unstyled';
  disabled?: boolean;
  readOnly?: boolean;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
};

type RichTextProps = {
  value: string;
  format?: RichTextFormat;
  mentions?: Pick<RichTextMentions, 'labelOf' | 'hrefOf' | 'onOpen'>;
  className?: string;
};
