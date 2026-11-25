import {
  Checkbox,
  MantineProvider,
  MultiSelect,
  NumberInput,
  Radio,
  Select,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { defineUseForm } from './index.js';

// Mantine's components with the library's defaults: no binding, only Mantine's prop names (`error` for the message
// and for "invalid" without one).
const useForm = defineUseForm({ props: { label: 'label', error: 'error', invalid: 'error' } });

type Field<S extends z.ZodObject<any>> = ReturnType<typeof useForm<S>>['field'];

beforeAll(() => {
  // What Mantine needs and jsdom lacks.
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => {};
});

/** Renders a form of the schema with the given fields; `save()` submits it, `submit` gets the data. */
function renderForm<S extends z.ZodObject<any>>(
  schema: S,
  fields: (field: Field<S>) => ReactNode,
  initial?: Parameters<typeof useForm<S>>[1]['initial'],
) {
  const submit = vi.fn();
  function F() {
    const { form, field } = useForm(schema, { submit, initial });
    return (
      <form {...form()}>
        {fields(field)}
        <button type="submit">Save</button>
      </form>
    );
  }
  render(
    // `env="test"`: no transitions and no portals.
    <MantineProvider env="test">
      <F />
    </MantineProvider>,
  );
  const user = userEvent.setup();
  return { user, submit, save: () => user.click(screen.getByRole('button', { name: 'Save' })) };
}

describe('Mantine components without bindings', () => {
  it('TextInput and Textarea: a string, and the message below the field', async () => {
    const { user, submit, save } = renderForm(
      z.object({ name: z.string().min(1), note: z.string().optional() }),
      (field) => (
        <>
          <TextInput {...field.name({ label: 'Name' })} />
          <Textarea {...field.note({ label: 'Note' })} />
        </>
      ),
    );
    await save();
    expect(submit).not.toHaveBeenCalled();
    const name = screen.getByLabelText(/Name/);
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Please fill out this field.')).toBeTruthy();
    await user.type(name, 'Ada');
    await user.type(screen.getByLabelText(/Note/), 'Hi');
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({ name: 'Ada', note: 'Hi' });
  });

  it('Checkbox and Switch: a boolean', async () => {
    const { user, submit, save } = renderForm(z.object({ terms: z.literal(true), news: z.boolean() }), (field) => (
      <>
        <Checkbox {...field.terms({ label: 'Terms' })} />
        <Switch {...field.news({ label: 'News' })} />
      </>
    ));
    await save();
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText('Terms'));
    await user.click(screen.getByLabelText('News'));
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({ terms: true, news: true });
  });

  it('Select: the chosen value', async () => {
    const { user, submit, save } = renderForm(
      z.object({ color: z.enum(['red', 'blue']) }),
      (field) => <Select clearable data={['red', 'blue']} {...field.color({ label: 'Color' })} />,
    );
    await save();
    expect(screen.getByText('Please fill out this field.')).toBeTruthy();
    await user.click(screen.getByLabelText(/Color/, { selector: 'input' }));
    await user.click(screen.getByRole('option', { name: 'blue' }));
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({ color: 'blue' });
  });

  it('MultiSelect: an array of the chosen values', async () => {
    const { user, submit, save } = renderForm(
      z.object({ tags: z.array(z.string()).min(1) }),
      (field) => <MultiSelect data={['a', 'b', 'c']} {...field.tags({ label: 'Tags' })} />,
    );
    await save();
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(/Tags/, { selector: 'input' }));
    await user.click(screen.getByRole('option', { name: 'a' }));
    await user.click(screen.getByRole('option', { name: 'c' }));
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({ tags: ['a', 'c'] });
  });

  it('NumberInput: a number; Mantine itself clamps to the bounds of the schema', async () => {
    const { user, submit, save } = renderForm(
      z.object({ age: z.number().min(18) }),
      (field) => <NumberInput {...field.age({ label: 'Age' })} />,
    );
    await save();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText('Please fill out this field.')).toBeTruthy();
    const age = screen.getByLabelText<HTMLInputElement>(/Age/);
    await user.type(age, '12');
    await user.tab();
    expect(age.value).toBe('18');
    await user.clear(age);
    await user.type(age, '42');
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({ age: 42 });
  });

  it('Radio.Group and Checkbox.Group: the chosen value or values', async () => {
    const { user, submit, save } = renderForm(
      z.object({ size: z.enum(['s', 'm']), days: z.array(z.string()).min(1) }),
      (field) => (
        <>
          <Radio.Group {...field.size({ label: 'Size' })}>
            <Radio value="s" label="Small" />
            <Radio value="m" label="Medium" />
          </Radio.Group>
          <Checkbox.Group {...field.days({ label: 'Days' })}>
            <Checkbox value="mo" label="Monday" />
            <Checkbox value="tu" label="Tuesday" />
          </Checkbox.Group>
        </>
      ),
    );
    await save();
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText('Medium'));
    await user.click(screen.getByLabelText('Tuesday'));
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({ size: 'm', days: ['tu'] });
  });

  it('DatePickerInput: an ISO date for z.iso.date(), a local Date for z.date()', async () => {
    const { user, submit, save } = renderForm(z.object({ from: z.iso.date(), to: z.date() }), (field) => (
      <>
        <DatePickerInput defaultDate="2026-11-01" {...field.from({ label: 'From' })} />
        <DatePickerInput defaultDate="2026-11-01" {...field.to({ label: 'To' })} />
      </>
    ));
    await user.click(screen.getByRole('button', { name: 'From' }));
    await user.click(screen.getByRole('button', { name: '25 November 2026' }));
    await user.click(screen.getByRole('button', { name: 'To' }));
    await user.click(screen.getByRole('button', { name: '26 November 2026' }));
    await save();
    const data = submit.mock.calls[0]?.[0];
    expect(data.from).toBe('2026-11-25');
    expect([data.to.getFullYear(), data.to.getMonth(), data.to.getDate(), data.to.getHours()]).toEqual([
      2026,
      10,
      26,
      0,
    ]);
  });

  it('shows the initial values of an edit form and submits them unchanged', async () => {
    const schema = z.object({
      name: z.string(),
      active: z.boolean(),
      color: z.enum(['red', 'blue']),
      age: z.number(),
      from: z.iso.date(),
    });
    const { submit, save } = renderForm(
      schema,
      (field) => (
        <>
          <TextInput {...field.name({ label: 'Name' })} />
          <Checkbox {...field.active({ label: 'Active' })} />
          <Select data={['red', 'blue']} {...field.color({ label: 'Color' })} />
          <NumberInput {...field.age({ label: 'Age' })} />
          <DatePickerInput {...field.from({ label: 'From' })} />
        </>
      ),
      { name: 'Ada', active: true, color: 'blue', age: 36, from: '2026-11-25' },
    );
    expect(screen.getByLabelText<HTMLInputElement>(/Name/).value).toBe('Ada');
    expect(screen.getByLabelText<HTMLInputElement>('Active').checked).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>(/Color/, { selector: 'input' }).value).toBe('blue');
    await save();
    expect(submit.mock.calls[0]?.[0]).toEqual({
      name: 'Ada',
      active: true,
      color: 'blue',
      age: 36,
      from: '2026-11-25',
    });
  });
});
