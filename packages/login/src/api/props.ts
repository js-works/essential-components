import type { ReactNode } from 'react';

import type { LoginTexts } from './texts.js';

export type { AccountRegistration, Credentials, LoginProvider, LoginScreenProps, PasswordReset };

type Credentials = {
  username: string;
  password: string;
};

type AccountRegistration = {
  username: string;
  email: string;
  password: string;
};

type PasswordReset = {
  account: string;
};

type LoginProvider = {
  id: string;
  label: string;
  icon?: ReactNode | string;
};

type LoginScreenProps = {
  title: string;
  subtitle?: string;
  logo?: ReactNode | string;
  hint?: ReactNode | string;
  texts?: Partial<LoginTexts>;
  onLogin: (credentials: Credentials) => void | Promise<void>;
  onForgotPassword?: (reset: PasswordReset) => void | Promise<void>;
  onRegister?: (registration: AccountRegistration) => void | Promise<void>;
  providers?: readonly LoginProvider[];
  onProvider?: (id: string) => void | Promise<void>;
  passwordLogin?: boolean;
};
