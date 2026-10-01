import type { z } from 'zod';
import { formRegistry } from './meta';
import type { FormMeta } from './types';

export { collectFields, getPath, setPath, unwrap };
export type { FieldInfo, FieldKind };

type FieldKind = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'other';

interface FieldInfo {
  path: string;
  schema: z.ZodType;
  kind: FieldKind;
  /** The semantic type for bindings: email, url, date, datetime, number, boolean, enum, string, ... */
  type: string;
  required: boolean;
  defaultValue: unknown;
  meta: FormMeta;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

const WRAPPERS = new Set(['optional', 'nullable', 'default', 'prefault', 'readonly', 'catch', 'nonoptional']);

function def(schema: z.ZodType): any {
  return (schema as any)._zod.def;
}

/** Removes the wrappers (optional, default, ...) and collects their metadata. */
function unwrap(schema: z.ZodType): { inner: z.ZodType; meta: FormMeta } {
  let current = schema;
  const metas: FormMeta[] = [];
  for (;;) {
    const m = formRegistry.get(current);
    if (m) metas.push(m);
    const d = def(current);
    if (WRAPPERS.has(d.type)) current = d.innerType;
    else if (d.type === 'pipe') current = d.in;
    else break;
  }
  // The inner metadata first, the outer ones override.
  return { inner: current, meta: Object.assign({}, ...metas.reverse()) };
}

const bounded = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < Number.MAX_SAFE_INTEGER;

function describe(path: string, schema: z.ZodType): FieldInfo {
  const { inner, meta } = unwrap(schema);
  const d = def(inner);
  const probe = schema.safeParse(undefined);
  const info: FieldInfo = {
    path,
    schema,
    kind: 'other',
    type: d.type,
    required: !probe.success,
    defaultValue: probe.success ? probe.data : undefined,
    meta,
  };

  switch (d.type) {
    case 'string': {
      const s = inner as z.ZodString;
      info.kind = 'string';
      if (s.minLength != null && s.minLength > 0) info.minLength = s.minLength;
      if (s.maxLength != null) info.maxLength = s.maxLength;
      // email, url, uuid, date, datetime, time, ...
      if (s.format) info.type = s.format;
      break;
    }
    case 'number': {
      const n = inner as z.ZodNumber;
      info.kind = 'number';
      if (bounded(n.minValue)) info.min = n.minValue;
      if (bounded(n.maxValue)) info.max = n.maxValue;
      break;
    }
    case 'boolean':
      info.kind = 'boolean';
      break;
    case 'date':
      info.kind = 'date';
      break;
    case 'enum':
    case 'literal':
      info.kind = 'enum';
      info.type = d.type === 'literal' && d.values?.length === 1 && d.values[0] === true ? 'boolean' : 'enum';
      if (info.type === 'boolean') info.kind = 'boolean';
      break;
  }

  if (meta.type) info.type = meta.type;
  return info;
}

/** All leaf fields of an object schema, in the order of the schema. */
function collectFields(schema: z.ZodObject<any>, prefix = ''): FieldInfo[] {
  const result: FieldInfo[] = [];
  for (const [key, child] of Object.entries(schema.shape as Record<string, z.ZodType>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const { inner } = unwrap(child);
    if (def(inner).type === 'object') result.push(...collectFields(inner as z.ZodObject<any>, path));
    else result.push(describe(path, child));
  }
  return result;
}

function getPath(obj: unknown, path: string): unknown {
  let cur: any = obj;
  for (const part of path.split('.')) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function setPath(obj: Record<string, any>, path: string, value: unknown): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  let cur = obj;
  for (const part of parts) cur = cur[part] ??= {};
  cur[last] = value;
}
