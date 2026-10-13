import type { ReactNode } from 'react';
import type { Texts } from './texts.js';

export type { Credentials, PasswordReset, Props, Provider, Registration };

type Credentials = {
  username: string;
  password: string;
};

type Registration = {
  username: string;
  email: string;
  password: string;
};

type PasswordReset = {
  account: string;
};

type Provider = {
  id: string;
  label: string;
  icon?: ReactNode | string;
};

type Props = {
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
