import React, { useEffect, useState } from 'react';

import { adminApi } from '../api';
import {
  Field,
  PairListInput,
  Select,
  StringListInput,
  TextArea,
  TextInput,
  Toggle,
} from './ui';

/**
 * A declarative description of one editable field. Every admin screen is a
 * list of these plus an entity name, which is why adding a new content
 * field is a one-line change rather than a new form component.
 */
export type FieldDef = {
  name: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'url'
    | 'email'
    | 'number'
    | 'toggle'
    | 'select'
    | 'list'
    | 'pairs'
    | 'media'
    | 'media-list'
    | 'json'
    | 'color'
    | 'highlights';
  help?: string;
  rows?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  mediaKind?: 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  multiline?: boolean;
  /** Span the full width of the two-column grid. */
  full?: boolean;
};

export type FormValues = Record<string, unknown>;

type MediaOption = { id: string; publicUrl: string; originalName: string; kind: string };

/** Dropdown over the media library, with a live thumbnail. */
const MediaPicker: React.FC<{
  value: string | null;
  onChange: (next: string | null) => void;
  kind?: string;
  id: string;
}> = ({ value, onChange, kind, id }) => {
  const [assets, setAssets] = useState<MediaOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    adminApi.media
      .list()
      .then((rows) => {
        if (!cancelled) setAssets(rows as MediaOption[]);
      })
      .catch(() => {
        /* Media store not configured yet — the picker just stays empty. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = kind ? assets.filter((asset) => asset.kind === kind) : assets;
  const selected = assets.find((asset) => asset.id === value);

  return (
    <div className="ad-row">
      <Select id={id} name={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">— none (use the bundled default) —</option>
        {options.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.originalName}
          </option>
        ))}
      </Select>

      {selected && selected.kind === 'IMAGE' && (
        <img
          src={selected.publicUrl}
          alt=""
          className="ad-thumb"
        />
      )}
    </div>
  );
};

const MediaListPicker: React.FC<{
  value: string[];
  onChange: (next: string[]) => void;
  kind?: string;
  id: string;
}> = ({ value, onChange, kind, id }) => {
  const [assets, setAssets] = useState<MediaOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    adminApi.media.list().then((rows) => {
      if (!cancelled) setAssets(rows as MediaOption[]);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const options = kind ? assets.filter((asset) => asset.kind === kind) : assets;
  return (
    <Select
      id={id}
      name={id}
      multiple
      size={Math.min(Math.max(options.length, 3), 7)}
      value={value}
      onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))}
    >
      {options.length === 0 && <option value="">Upload images in Media first</option>}
      {options.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName}</option>)}
    </Select>
  );
};

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const arr = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export const FieldRenderer: React.FC<{
  field: FieldDef;
  value: unknown;
  errors?: string[];
  onChange: (name: string, next: unknown) => void;
}> = ({ field, value, errors, onChange }) => {
  const id = `field-${field.name}`;
  const set = (next: unknown) => onChange(field.name, next);

  if (field.type === 'toggle') {
    return (
      <div className={field.full ? 'ad-field--wide' : ''}>
        <Toggle
          checked={value === true}
          onChange={set}
          label={field.label}
          help={field.help}
          id={id}
        />
        {errors?.map((error) => (
          <p key={error} className="ad-error" role="alert">
            {error}
          </p>
        ))}
      </div>
    );
  }

  const body = (() => {
    switch (field.type) {
      case 'textarea':
        return (
          <TextArea
            id={id}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            value={str(value)}
            onChange={(e) => set(e.target.value)}
          />
        );

      case 'select':
        return (
          <Select id={id} value={str(value)} onChange={(e) => set(e.target.value)}>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'list':
        return (
          <StringListInput
            value={arr(value)}
            onChange={set}
            placeholder={field.placeholder}
            multiline={field.multiline}
            name={id}
          />
        );

      case 'pairs':
        return (
          <PairListInput
            value={
              Array.isArray(value)
                ? (value as { label: string; value: string }[])
                : []
            }
            onChange={set}
            name={id}
          />
        );

      case 'highlights': {
        const items = Array.isArray(value)
          ? (value as { kind: string; text: string }[])
          : [];
        const update = (next: { kind: string; text: string }[]) => set(next);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, index) => (
              <div key={index} className="ad-row">
                <Select
                  id={index === 0 ? id : `${id}-${index}-kind`}
                  name={index === 0 ? id : `${id}-${index}-kind`}
                  style={{ width: 150, flexShrink: 0 }}
                  value={item.kind}
                  onChange={(e) =>
                    update(
                      items.map((row, i) => (i === index ? { ...row, kind: e.target.value } : row)),
                    )
                  }
                >
                  <option value="CAPABILITY">Capability</option>
                  <option value="OUTCOME">Outcome</option>
                </Select>
                <TextArea
                  id={`${id}-${index}-text`}
                  name={`${id}-${index}-text`}
                  rows={2}
                  value={item.text}
                  onChange={(e) =>
                    update(
                      items.map((row, i) => (i === index ? { ...row, text: e.target.value } : row)),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => update(items.filter((_, i) => i !== index))}
                  className="ad-icon-btn"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update([...items, { kind: 'CAPABILITY', text: '' }])}
              className="ad-link"
            >
              + Add highlight
            </button>
          </div>
        );
      }

      case 'media':
        return (
          <MediaPicker
            value={typeof value === 'string' && value ? value : null}
            onChange={set}
            kind={field.mediaKind}
            id={id}
          />
        );

      case 'media-list':
        return (
          <MediaListPicker
            value={arr(value)}
            onChange={set}
            kind={field.mediaKind}
            id={id}
          />
        );

      case 'json':
        return (
          <TextArea
            id={id}
            rows={field.rows ?? 10}
            spellCheck={false}
            className="ad-mono"
            value={
              typeof value === 'string' ? value : value ? JSON.stringify(value, null, 2) : ''
            }
            onChange={(e) => set(e.target.value)}
          />
        );

      case 'color':
        return (
          <div className="ad-row" style={{ alignItems: 'center' }}>
            <input
              id={id}
              name={id}
              type="color"
              value={str(value) || '#000000'}
              onChange={(e) => set(e.target.value.toUpperCase())}
              style={{ height: 36, width: 46, cursor: 'pointer', borderRadius: 7, border: '1px solid var(--ad-border-strong)', background: 'var(--ad-surface)', padding: 2 }}
            />
            <TextInput id={`${id}-value`} name={`${id}-value`} value={str(value)} onChange={(e) => set(e.target.value.toUpperCase())} />
          </div>
        );

      case 'number':
        return (
          <TextInput
            id={id}
            type="number"
            value={typeof value === 'number' ? String(value) : str(value)}
            onChange={(e) => set(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        );

      default:
        return (
          <TextInput
            id={id}
            type={field.type === 'email' ? 'email' : 'text'}
            placeholder={field.placeholder}
            value={str(value)}
            onChange={(e) => set(e.target.value)}
          />
        );
    }
  })();

  return (
    <div className={field.full ? 'ad-field--wide' : ''}>
      <Field label={field.label} htmlFor={id} help={field.help} errors={errors}>
        {body}
      </Field>
    </div>
  );
};

export const FieldGrid: React.FC<{
  fields: readonly FieldDef[];
  values: FormValues;
  errors?: Record<string, string[]>;
  onChange: (name: string, next: unknown) => void;
}> = ({ fields, values, errors, onChange }) => (
  <div className="ad-field-grid">
    {fields.map((field) => (
      <FieldRenderer
        key={field.name}
        field={field}
        value={values[field.name]}
        errors={errors?.[field.name]}
        onChange={onChange}
      />
    ))}
  </div>
);

/** Pulls just the declared fields out of a row, ready to POST back. */
export function pick(fields: readonly FieldDef[], row: FormValues): FormValues {
  const output: FormValues = {};
  for (const field of fields) {
    let value = row[field.name];

    if (field.type === 'json' && typeof value === 'string') {
      try {
        value = value.trim() ? JSON.parse(value) : null;
      } catch {
        // Leave the raw string; the server reports the validation error.
      }
    }

    output[field.name] = value ?? defaultFor(field);
  }
  return output;
}

export function defaultFor(field: FieldDef): unknown {
  switch (field.type) {
    case 'toggle':
      return false;
    case 'list':
    case 'pairs':
    case 'highlights':
    case 'media-list':
      return [];
    case 'number':
      return 0;
    case 'json':
    case 'media':
      return null;
    case 'select':
      return field.options?.[0]?.value ?? '';
    default:
      return '';
  }
}

export function blankValues(fields: readonly FieldDef[]): FormValues {
  return Object.fromEntries(fields.map((field) => [field.name, defaultFor(field)]));
}
