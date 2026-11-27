import { describe, expect, it, vi } from 'vitest';

import type { LoginElement as PublicLoginElement } from '../../main/index.js';
import { createLoginClass } from '../../main/index.js';

// The element as Lit has it: its `updateComplete` (not in the public type).
type LoginElement = PublicLoginElement & { readonly updateComplete: Promise<boolean> };

let tags = 0;

// A new class and element each time.
async function mount(content = '', setup: (login: LoginElement) => void = () => {}): Promise<LoginElement> {
  const tag = `test-login-${++tags}`;

  customElements.define(tag, createLoginClass());

  const login = document.createElement(tag) as LoginElement;

  login.innerHTML = content;
  setup(login);
  document.body.append(login);
  await login.updateComplete;

  return login;
}

const shadow = (login: LoginElement) => login.shadowRoot!;
const slot = (login: LoginElement, name?: string) =>
  shadow(login).querySelector<HTMLSlotElement>(name === undefined ? 'slot:not([name])' : `slot[name="${name}"]`)!;

// `slotchange` comes in a task of its own, then the render.
async function settle(login: LoginElement): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  await login.updateComplete;
}

describe('the login element', () => {
  it('the title, the subtitle and the heading', async () => {
    const login = await mount('', (element) => {
      element.appTitle = 'Back Office';
      element.subtitle = 'Acme Corporate';
      element.heading = 'Sign in';
    });

    expect(shadow(login).querySelector('.title')?.textContent).toBe('Back Office');
    expect(shadow(login).querySelector('.subtitle')?.textContent).toBe('Acme Corporate');
    expect(shadow(login).querySelector('.heading')?.textContent).toBe('Sign in');
    expect(login.getAttribute('title')).toBeNull();

    login.subtitle = '';
    login.heading = '';
    await login.updateComplete;
    expect(shadow(login).querySelector('.subtitle')).toBeNull();
    expect(shadow(login).querySelector('.heading')).toBeNull();
  });

  it('adds no children of its own: the host content stays in the light DOM', async () => {
    const login = await mount('<form><input name="username" autocomplete="username"></form>');

    expect(login.children).toHaveLength(1);
    expect(slot(login).assignedElements()[0]?.tagName).toBe('FORM');
    expect(shadow(login).querySelector('input')).toBeNull();
  });

  it('the logo: the default in the shadow root, else the slotted one', async () => {
    const plain = await mount();

    expect(slot(plain, 'logo').querySelector('svg')).not.toBeNull();
    expect(slot(plain, 'logo').assignedNodes()).toEqual([]);

    const own = await mount('<svg slot="logo"></svg>');

    expect(slot(own, 'logo').assignedNodes()).toHaveLength(1);
  });

  it('the footer: its line only with content', async () => {
    const login = await mount();
    const footer = shadow(login).querySelector<HTMLElement>('.footer')!;

    expect(footer.hidden).toBe(true);

    login.insertAdjacentHTML('beforeend', '<span slot="footer">Back to sign in</span>');
    await settle(login);
    expect(footer.hidden).toBe(false);

    login.querySelector('[slot="footer"]')!.remove();
    await settle(login);
    expect(footer.hidden).toBe(true);
  });

  it('the hint below the card', async () => {
    const login = await mount('<span slot="hint">A demo.</span>');

    expect(slot(login, 'hint').assignedNodes()).toHaveLength(1);
    expect(shadow(login).querySelector('.card slot[name="hint"]')).toBeNull();
  });

  it('the providers: only with `signInWith`; the line "or" only after content', async () => {
    const providers = [{ id: 'sso', label: 'Company SSO' }, { id: 'google', label: 'Google' }];
    const none = await mount('', (element) => {
      element.providers = providers;
    });

    expect(shadow(none).querySelector('.provider')).toBeNull();

    const alone = await mount('', (element) => {
      element.providers = providers;
      element.signInWith = vi.fn();
    });

    expect([...shadow(alone).querySelectorAll('.provider')].map((button) => button.textContent?.trim())).toEqual([
      'Continue with Company SSO',
      'Continue with Google',
    ]);
    expect(shadow(alone).querySelector('.or')).toBeNull();

    const withForm = await mount('<form></form>', (element) => {
      element.providers = providers;
      element.signInWith = vi.fn();
    });

    await settle(withForm);
    expect(shadow(withForm).querySelector('.or')?.textContent).toBe('or');
  });

  it('a provider: the spinner while it runs, the others disabled; a failure below them', async () => {
    let fail!: (reason: unknown) => void;
    const login = await mount('', (element) => {
      element.providers = [{ id: 'sso', label: 'Company SSO' }, { id: 'google', label: 'Google' }];
      element.signInWith = vi.fn(() => new Promise<void>((_, reject) => (fail = reject)));
    });
    const [sso, google] = [...shadow(login).querySelectorAll<HTMLButtonElement>('.provider')];

    sso!.click();
    await login.updateComplete;

    expect(login.signInWith).toHaveBeenCalledWith('sso');
    expect(sso!.getAttribute('aria-busy')).toBe('true');
    expect(sso!.querySelector('.spinner')).not.toBeNull();
    expect(google!.disabled).toBe(true);

    fail(new Error(''));
    await settle(login);

    expect(google!.disabled).toBe(false);
    expect(shadow(login).querySelector('.alert')?.textContent).toBe('The sign in failed. Please try again.');
  });

  it('the submit button submits the host\'s form; so does Enter in its inputs', async () => {
    const login = await mount('<div><form><input name="username"><input name="password"></form></div>', (element) => {
      element.submitLabel = 'Sign in';
    });
    const onSubmit = vi.fn((event: Event) => event.preventDefault());

    login.querySelector('form')!.addEventListener('submit', onSubmit);
    await settle(login);

    const button = shadow(login).querySelector<HTMLButtonElement>('.primary')!;

    expect(button.textContent?.trim()).toBe('Sign in');
    button.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    login.querySelector('input')!.dispatchEvent(enter);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(enter.defaultPrevented).toBe(true);

    // Enter that an input used itself (e.g. a select's list) is left alone.
    const used = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    login.querySelector('input')!.addEventListener('keydown', (event) => event.preventDefault(), { once: true });
    login.querySelector('input')!.dispatchEvent(used);
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('the submit button: none without a label; the spinner while submitting', async () => {
    const login = await mount('<form></form>');

    expect(shadow(login).querySelector('.primary')).toBeNull();

    login.submitLabel = 'Register';
    login.submitting = true;
    await login.updateComplete;

    const button = shadow(login).querySelector<HTMLButtonElement>('.primary')!;

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.spinner')).not.toBeNull();
    expect(login.hasAttribute('submitting')).toBe(true);
  });
});
