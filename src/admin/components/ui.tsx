import React from 'react';

/**
 * Admin form primitives.
 *
 * They deliberately reuse the portfolio's own tokens — `surface`, `line`,
 * `gold`, `font-body`, `label-mono` — so the panel looks like it belongs to
 * the site rather than like a bolted-on dashboard. None of this CSS touches
 * the public pages.
 */

export const inputClass =
  'w-full bg-surface-2 border border-line focus:border-gold text-fg placeholder:text-fg-subtle/60 font-body text-[13px] px-3.5 py-2.5 outline-none rounded-[2px] transition-colors disabled:opacity-50';

type LabelProps = {
  label: string;
  htmlFor?: string;
  help?: string;
  errors?: string[];
  children: React.ReactNode;
};

export const Field: React.FC<LabelProps> = ({ label, htmlFor, help, errors, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="label-mono block text-fg-subtle">
      {label}
    </label>
    {children}
    {help && <p className="font-body text-[11px] font-light text-fg-subtle/80">{help}</p>}
    {errors?.map((error) => (
      <p key={error} className="font-body text-[11px] text-red-400" role="alert">
        {error}
      </p>
    ))}
  </div>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={`${inputClass} resize-y ${props.className ?? ''}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`${inputClass} ${props.className ?? ''}`} />
);

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  help?: string;
}> = ({ checked, onChange, label, help }) => (
  <label className="flex cursor-pointer items-start gap-3 py-1">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`mt-0.5 relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked ? 'border-gold bg-gold/30' : 'border-line bg-surface-3'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
          checked ? 'left-[18px] bg-gold' : 'left-0.5 bg-fg-subtle'
        }`}
      />
    </button>
    <span className="min-w-0">
      <span className="block font-body text-[12.5px] text-fg">{label}</span>
      {help && (
        <span className="block font-body text-[11px] font-light text-fg-subtle/80">{help}</span>
      )}
    </span>
  </label>
);

/** Editable list of plain strings (skills, bullet points, keywords). */
export const StringListInput: React.FC<{
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  multiline?: boolean;
}> = ({ value, onChange, placeholder, addLabel = 'Add item', multiline = false }) => {
  const set = (index: number, next: string) =>
    onChange(value.map((item, i) => (i === index ? next : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          {multiline ? (
            <TextArea
              rows={2}
              value={item}
              placeholder={placeholder}
              onChange={(e) => set(index, e.target.value)}
            />
          ) : (
            <TextInput
              value={item}
              placeholder={placeholder}
              onChange={(e) => set(index, e.target.value)}
            />
          )}
          <div className="flex shrink-0 gap-1 pt-1">
            <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
              ↑
            </IconButton>
            <IconButton
              label="Move down"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
            >
              ↓
            </IconButton>
            <IconButton
              label="Remove"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              ✕
            </IconButton>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="font-body text-[11.5px] text-gold hover:underline underline-offset-4"
      >
        + {addLabel}
      </button>
    </div>
  );
};

/** Editable list of label/value pairs (project metrics). */
export const PairListInput: React.FC<{
  value: { label: string; value: string }[];
  onChange: (next: { label: string; value: string }[]) => void;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
}> = ({ value, onChange, labelPlaceholder = 'Label', valuePlaceholder = 'Value' }) => (
  <div className="space-y-2">
    {value.map((pair, index) => (
      <div key={index} className="flex items-start gap-2">
        <TextInput
          value={pair.label}
          placeholder={labelPlaceholder}
          onChange={(e) =>
            onChange(value.map((p, i) => (i === index ? { ...p, label: e.target.value } : p)))
          }
        />
        <TextInput
          value={pair.value}
          placeholder={valuePlaceholder}
          onChange={(e) =>
            onChange(value.map((p, i) => (i === index ? { ...p, value: e.target.value } : p)))
          }
        />
        <div className="pt-1">
          <IconButton label="Remove" onClick={() => onChange(value.filter((_, i) => i !== index))}>
            ✕
          </IconButton>
        </div>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...value, { label: '', value: '' }])}
      className="font-body text-[11.5px] text-gold hover:underline underline-offset-4"
    >
      + Add row
    </button>
  </div>
);

export const IconButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className="grid h-8 w-8 place-items-center rounded-[2px] border border-line bg-surface-2 text-[11px] text-fg-muted transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
  >
    {children}
  </button>
);

export const Panel: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, actions, children }) => (
  <section className="rounded-[2px] border border-line bg-surface/85 p-5 sm:p-7">
    {(title || actions) && (
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {title && (
            <h2 className="font-display text-[1.6rem] leading-none tracking-wide text-fg-strong">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 max-w-xl font-body text-[12px] font-light leading-relaxed text-fg-muted">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
    )}
    {children}
  </section>
);

type ToneButton = 'primary' | 'outline' | 'danger';

export const ActionButton: React.FC<
  { tone?: ToneButton; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ tone = 'outline', loading = false, children, className = '', ...rest }) => {
  const tones: Record<ToneButton, string> = {
    primary: 'border-gold bg-gold/15 text-gold hover:bg-gold/25',
    outline: 'border-line bg-surface-2 text-fg-muted hover:border-gold hover:text-gold',
    danger: 'border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  };

  return (
    <button
      type="button"
      disabled={loading || rest.disabled}
      {...rest}
      className={`inline-flex items-center gap-2 rounded-[2px] border px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {loading ? 'Working…' : children}
    </button>
  );
};

export const StatusPill: React.FC<{ published: boolean }> = ({ published }) => (
  <span
    className={`inline-flex shrink-0 items-center rounded-[2px] border px-2 py-0.5 font-body text-[8.5px] font-semibold uppercase tracking-[0.16em] ${
      published
        ? 'border-line text-fg-subtle'
        : 'border-gold/50 bg-gold/10 text-gold'
    }`}
  >
    {published ? 'Published' : 'Draft changes'}
  </span>
);

export const Banner: React.FC<{ tone: 'success' | 'error' | 'info'; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const tones = {
    success: 'border-gold/40 bg-gold/10 text-gold',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
    info: 'border-line bg-surface-2 text-fg-muted',
  } as const;

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-[2px] border px-4 py-2.5 font-body text-[12px] ${tones[tone]}`}
    >
      {children}
    </p>
  );
};

export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-[2px] border border-dashed border-line px-4 py-8 text-center font-body text-[12px] font-light text-fg-subtle">
    {children}
  </p>
);
