import type { ReactNode } from 'react';

export type Credentials = {
  username: string;
  password: string;
};

export type Registration = {
  username: string;
  email: string;
  password: string;
};

export type PasswordReset = {
  account: string;
};

export type Provider = {
  id: string;
  label: string;
  icon?: ReactNode | string;
};

export type Texts = {
  heading: string;
  username: string;
  password: string;
  submit: string;
  required: string;
  failed: string;
  forgotLink: string;
  forgotHeading: string;
  forgotIntro: string;
  account: string;
  forgotSubmit: string;
  forgotDone: string;
  registerPrompt: string;
  registerLink: string;
  registerHeading: string;
  registerSubmit: string;
  registerDone: string;
  email: string;
  passwordRepeat: string;
  invalidEmail: string;
  mismatch: string;
  back: string;
  continueWith: string;
  or: string;
  providerFailed: string;
};

export type Props = {
  title: string;
  subtitle?: string;
  logo?: ReactNode | string;
  hint?: ReactNode | string;
  texts?: Partial<Texts>;
  onLogin: (credentials: Credentials) => void | Promise<void>;
  onForgotPassword?: (reset: PasswordReset) => void | Promise<void>;
  onRegister?: (registration: Registration) => void | Promise<void>;
  providers?: readonly Provider[];
  onProvider?: (id: string) => void | Promise<void>;
  passwordLogin?: boolean;
};

export type Mounted = {
  update(props: Partial<Props>): void;
  unmount(): void;
};
