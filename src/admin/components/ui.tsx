import React from 'react';

/**
 * Admin form and layout primitives.
 *
 * All styling comes from `admin.css`, scoped under `.ad`. Nothing here reads
 * the portfolio's tokens, so the dashboard can look like a tool without the
 * public site changing at all.
 */

export const inputClass = 'ad-input';

type FieldProps = {
  label: string;
  htmlFor?: string;
  help?: string;
  errors?: string[];
  children: React.ReactNode;
};

export const Field: React.FC<FieldProps> = ({ label, htmlFor, help, errors, children }) => (
  <div>
    <label htmlFor={htmlFor} className="ad-label">
      {label}
    </label>
    {children}
    {help && <p className="ad-help">{help}</p>}
    {errors?.map((error) => (
      <p key={error} className="ad-error" role="alert">
        {error}
      </p>
    ))}
  </div>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...rest
}) => <input {...rest} className={`ad-input ${className}`.trim()} />;

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  ...rest
}) => <textarea {...rest} className={`ad-textarea ${className}`.trim()} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  ...rest
}) => <select {...rest} className={`ad-select ${className}`.trim()} />;

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  help?: string;
}> = ({ checked, onChange, label, help }) => (
  <div className="ad-toggle">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="ad-switch"
    />
    <span>
      <span className="ad-toggle-text">{label}</span>
      {help && <span className="ad-help" style={{ marginTop: 2, display: 'block' }}>{help}</span>}
    </span>
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
    className="ad-icon-btn"
  >
    {children}
  </button>
);

/** Editable list of plain strings (skills, bullets, keywords). */
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.map((item, index) => (
        <div key={index} className="ad-row">
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
          <IconButton label="Remove" onClick={() => onChange(value.filter((_, i) => i !== index))}>
            ✕
          </IconButton>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...value, ''])} className="ad-link">
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {value.map((pair, index) => (
      <div key={index} className="ad-row">
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
        <IconButton label="Remove" onClick={() => onChange(value.filter((_, i) => i !== index))}>
          ✕
        </IconButton>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...value, { label: '', value: '' }])}
      className="ad-link"
    >
      + Add row
    </button>
  </div>
);

export const Panel: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, actions, children }) => (
  <section className="ad-card">
    {(title || actions) && (
      <header className="ad-card-head">
        <div>
          {title && <h2 className="ad-card-title">{title}</h2>}
          {description && <p className="ad-card-desc">{description}</p>}
        </div>
        {actions && <div className="ad-actions">{actions}</div>}
      </header>
    )}
    <div className="ad-card-body">{children}</div>
  </section>
);

type Tone = 'primary' | 'outline' | 'danger';

export const ActionButton: React.FC<
  { tone?: Tone; loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ tone = 'outline', loading = false, children, className = '', ...rest }) => {
  const toneClass = tone === 'primary' ? 'ad-btn--primary' : tone === 'danger' ? 'ad-btn--danger' : '';
  return (
    <button
      type="button"
      {...rest}
      disabled={loading || rest.disabled}
      className={`ad-btn ${toneClass} ${className}`.trim()}
    >
      {loading ? 'Working…' : children}
    </button>
  );
};

export const StatusPill: React.FC<{ published: boolean }> = ({ published }) => (
  <span className={`ad-chip ${published ? 'ad-chip--ok' : 'ad-chip--draft'}`}>
    {published ? 'Published' : 'Unpublished changes'}
  </span>
);

export const Banner: React.FC<{ tone: 'success' | 'error' | 'info'; children: React.ReactNode }> = ({
  tone,
  children,
}) => (
  <p role={tone === 'error' ? 'alert' : 'status'} className={`ad-banner ad-banner--${tone}`}>
    {children}
  </p>
);

export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="ad-empty">{children}</p>
);
