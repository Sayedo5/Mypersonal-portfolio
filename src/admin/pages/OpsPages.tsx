import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError, adminApi, authApi } from '../api';
import {
  ActionButton,
  Banner,
  EmptyState,
  Field,
  Panel,
  TextInput,
} from '../components/ui';

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// ------------------------------------------------------------ overview

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminApi.overview>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .overview()
      .then(setData)
      .catch((caught) =>
        setError(caught instanceof ApiError ? caught.message : 'Could not load the dashboard.'),
      );
  }, []);

  const tiles = data
    ? [
        { label: 'Unpublished drafts', value: data.draftCount, to: null },
        { label: 'Projects', value: data.projectCount, to: '/admin/projects' },
        { label: 'Unread messages', value: data.unreadMessageCount, to: '/admin/inbox' },
        { label: 'Media files', value: data.mediaCount, to: '/admin/media' },
      ]
    : [];

  return (
    <>
      <Panel
        title={data ? `Welcome back, ${data.owner.name.split(' ')[0]}` : 'Overview'}
        description="Edits are saved as drafts. Publish a section — or everything at once from the header — to push it to the live site."
      >
        {error && <Banner tone="error">{error}</Banner>}

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-line bg-line lg:grid-cols-4">
          {tiles.map((tile) => {
            const body = (
              <>
                <span className="block font-display text-[2.4rem] leading-none text-fg-strong">
                  {tile.value}
                </span>
                <span className="mt-2 block font-body text-[9.5px] font-medium uppercase tracking-[0.18em] text-fg-muted">
                  {tile.label}
                </span>
              </>
            );

            return tile.to ? (
              <Link
                key={tile.label}
                to={tile.to}
                className="bg-surface p-5 transition-colors hover:bg-surface-3"
              >
                {body}
              </Link>
            ) : (
              <div key={tile.label} className="bg-surface p-5">
                {body}
              </div>
            );
          })}
        </div>

        {data && (
          <p className="mt-4 font-body text-[11.5px] font-light text-fg-subtle">
            Last publish: {formatDate(data.lastPublishedAt)}
          </p>
        )}
      </Panel>

      <Panel title="Recent activity" description="Every administrative change is recorded.">
        {!data ? (
          <p className="font-body text-[12px] text-fg-subtle">Loading…</p>
        ) : data.recentEvents.length === 0 ? (
          <EmptyState>No activity yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-line-soft">
            {data.recentEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="font-body text-[12.5px] text-fg">
                  <span className="text-gold">{event.action}</span> · {event.entityType}
                </span>
                <span className="font-mono text-[10px] text-fg-subtle">
                  {formatDate(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
};

// --------------------------------------------------------------- media

type MediaAsset = Awaited<ReturnType<typeof adminApi.media.list>>[number];

export const MediaPage: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setAssets(await adminApi.media.list());
    } catch (error) {
      setBanner({
        tone: 'error',
        text: error instanceof ApiError ? error.message : 'Could not load the media library.',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setBanner(null);
    try {
      const { token, pathPrefix } = await adminApi.media.uploadToken();

      // Upload straight from the browser to Vercel Blob, so a large file
      // never has to pass through a serverless function's body limit.
      const { put } = await import('@vercel/blob');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
      const blob = await put(`${pathPrefix}/${Date.now()}-${safeName}`, file, {
        access: 'public',
        token,
        contentType: file.type,
      });

      await adminApi.media.register({
        storageKey: blob.pathname,
        publicUrl: blob.url,
        originalName: file.name,
        mimeType: file.type,
        byteSize: file.size,
        altText: null,
      });

      setBanner({ tone: 'success', text: `Uploaded ${file.name}.` });
      await load();
    } catch (error) {
      setBanner({
        tone: 'error',
        text:
          error instanceof ApiError
            ? error.message
            : 'Upload failed. Check that a Vercel Blob store is linked and BLOB_READ_WRITE_TOKEN is set.',
      });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const saveAlt = async (id: string, altText: string) => {
    try {
      await adminApi.media.setAlt(id, altText || null);
      setBanner({ tone: 'success', text: 'Alt text saved.' });
    } catch (error) {
      setBanner({
        tone: 'error',
        text: error instanceof ApiError ? error.message : 'Could not save the alt text.',
      });
    }
  };

  const remove = async (asset: MediaAsset) => {
    if (!window.confirm(`Delete ${asset.originalName} permanently?`)) return;
    try {
      await adminApi.media.remove(asset.id);
      setBanner({ tone: 'success', text: 'File deleted.' });
      await load();
    } catch (error) {
      setBanner({
        tone: 'error',
        text: error instanceof ApiError ? error.message : 'Could not delete that file.',
      });
    }
  };

  return (
    <Panel
      title="Media"
      description="Images, the resume PDF and the hero video. Files referenced anywhere on the site cannot be deleted until the reference is removed."
      actions={
        <>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            accept="image/*,video/mp4,video/webm,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <ActionButton
            tone="primary"
            loading={uploading}
            onClick={() => fileInput.current?.click()}
          >
            Upload file
          </ActionButton>
        </>
      }
    >
      {banner && (
        <div className="mb-5">
          <Banner tone={banner.tone}>{banner.text}</Banner>
        </div>
      )}

      {assets.length === 0 ? (
        <EmptyState>No files yet. Upload an image, a PDF or an MP4 to get started.</EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex flex-col gap-3 rounded-[2px] border border-line bg-surface-2/60 p-3"
            >
              <div className="flex items-start gap-3">
                {asset.kind === 'IMAGE' ? (
                  <img
                    src={asset.publicUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-[2px] border border-line object-cover"
                  />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[2px] border border-line bg-surface-3 font-mono text-[9px] uppercase text-fg-subtle">
                    {asset.kind}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-[12.5px] text-fg">{asset.originalName}</p>
                  <p className="font-mono text-[10px] text-fg-subtle">
                    {(asset.byteSize / 1024).toFixed(0)} KB
                  </p>
                  <a
                    href={asset.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[11px] text-gold hover:underline underline-offset-4"
                  >
                    Open ↗
                  </a>
                </div>
              </div>

              <Field label="// ALT TEXT">
                <TextInput
                  defaultValue={asset.altText ?? ''}
                  placeholder="Describe the image"
                  onBlur={(e) => void saveAlt(asset.id, e.target.value)}
                />
              </Field>

              <ActionButton tone="danger" onClick={() => void remove(asset)}>
                Delete
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

// --------------------------------------------------------------- inbox

export const InboxPage: React.FC = () => {
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof adminApi.inbox.list>>>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'ARCHIVED'>('ALL');
  const [openId, setOpenId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMessages(await adminApi.inbox.list(filter));
    } catch (error) {
      setBanner(error instanceof ApiError ? error.message : 'Could not load the inbox.');
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: 'UNREAD' | 'READ' | 'ARCHIVED') => {
    await adminApi.inbox.setStatus(id, status);
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    await adminApi.inbox.remove(id);
    await load();
  };

  return (
    <Panel
      title="Inbox"
      description="Messages sent through the contact form on the portfolio."
      actions={
        <div className="flex gap-1">
          {(['ALL', 'UNREAD', 'READ', 'ARCHIVED'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-[2px] border px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.14em] transition-colors ${
                filter === value
                  ? 'border-gold text-gold'
                  : 'border-line text-fg-subtle hover:text-fg'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      }
    >
      {banner && (
        <div className="mb-5">
          <Banner tone="error">{banner}</Banner>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState>Nothing here.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <li key={message.id} className="rounded-[2px] border border-line bg-surface-2/60">
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(open ? null : message.id);
                    if (!open && message.status === 'UNREAD') void setStatus(message.id, 'READ');
                  }}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-body text-[13px] text-fg">
                      {message.name}{' '}
                      <span className="text-fg-subtle">· {message.email}</span>
                    </span>
                    <span className="block truncate font-body text-[11px] font-light text-fg-subtle">
                      {message.subject ?? 'Project enquiry'}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    {message.status === 'UNREAD' && (
                      <span className="rounded-[2px] border border-gold/50 bg-gold/10 px-2 py-0.5 font-body text-[8.5px] uppercase tracking-[0.16em] text-gold">
                        New
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-fg-subtle">
                      {formatDate(message.createdAt)}
                    </span>
                  </span>
                </button>

                {open && (
                  <div className="space-y-4 border-t border-line-soft p-4">
                    {message.company && (
                      <p className="font-body text-[12px] text-fg-muted">
                        Company: {message.company}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap font-body text-[12.5px] font-light leading-relaxed text-fg-muted">
                      {message.message}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        tone="primary"
                        onClick={() => {
                          window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(
                            `Re: ${message.subject ?? 'your enquiry'}`,
                          )}`;
                        }}
                      >
                        Reply by email
                      </ActionButton>
                      <ActionButton
                        onClick={() =>
                          void setStatus(
                            message.id,
                            message.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED',
                          )
                        }
                      >
                        {message.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
                      </ActionButton>
                      <ActionButton tone="danger" onClick={() => void remove(message.id)}>
                        Delete
                      </ActionButton>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
};

// --------------------------------------------------------------- audit

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<Awaited<ReturnType<typeof adminApi.audit>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .audit(200)
      .then(setEvents)
      .catch((caught) =>
        setError(caught instanceof ApiError ? caught.message : 'Could not load the audit log.'),
      );
  }, []);

  return (
    <Panel
      title="Audit log"
      description="Every administrative action, with passwords, tokens and message bodies redacted."
    >
      {error && <Banner tone="error">{error}</Banner>}

      {events.length === 0 ? (
        <EmptyState>No entries yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                {['Action', 'Entity', 'By', 'When'].map((heading) => (
                  <th key={heading} className="label-mono py-2 pr-4 text-fg-subtle">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-line-soft">
                  <td className="py-2 pr-4 font-mono text-[11px] text-gold">{event.action}</td>
                  <td className="py-2 pr-4 font-body text-[12px] text-fg-muted">
                    {event.entityType}
                  </td>
                  <td className="py-2 pr-4 font-body text-[12px] text-fg-subtle">
                    {event.ownerUser?.name ?? 'system'}
                  </td>
                  <td className="py-2 font-mono text-[10px] text-fg-subtle">
                    {formatDate(event.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

// ------------------------------------------------------------ security

export const SecurityPage: React.FC<{ onSignedOut: () => void }> = ({ onSignedOut }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy('password');
    setErrors({});
    try {
      await authApi.changePassword(form);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setBanner({
        tone: 'success',
        text: 'Password changed. Every other signed-in device was signed out.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setBanner({ tone: 'error', text: error.message });
      }
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async () => {
    if (!window.confirm('Generate new recovery codes? The current ones stop working.')) return;
    setBusy('codes');
    try {
      const result = await authApi.regenerateCodes();
      setCodes(result.backupCodes);
      setBanner({ tone: 'success', text: 'New recovery codes generated. Save them now.' });
    } catch (error) {
      if (error instanceof ApiError) setBanner({ tone: 'error', text: error.message });
    } finally {
      setBusy(null);
    }
  };

  const revoke = async () => {
    if (!window.confirm('Sign out every device, including this one?')) return;
    try {
      await authApi.revokeSessions();
    } finally {
      onSignedOut();
    }
  };

  return (
    <>
      <Panel title="Security" description="Two-factor authentication is required and cannot be turned off.">
        {banner && (
          <div className="mb-5">
            <Banner tone={banner.tone}>{banner.text}</Banner>
          </div>
        )}

        <form onSubmit={changePassword} className="grid max-w-xl grid-cols-1 gap-5">
          <Field label="// CURRENT PASSWORD" errors={errors.currentPassword}>
            <TextInput
              type="password"
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </Field>

          <Field
            label="// NEW PASSWORD"
            help="At least 12 characters."
            errors={errors.newPassword}
          >
            <TextInput
              type="password"
              required
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </Field>

          <Field label="// CONFIRM NEW PASSWORD" errors={errors.confirmPassword}>
            <TextInput
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </Field>

          <div>
            <ActionButton tone="primary" type="submit" loading={busy === 'password'}>
              Change password
            </ActionButton>
          </div>
        </form>
      </Panel>

      <Panel
        title="Recovery codes"
        description="One-time codes that get you in if you lose your authenticator app."
        actions={
          <ActionButton onClick={regenerate} loading={busy === 'codes'}>
            Generate new codes
          </ActionButton>
        }
      >
        {codes ? (
          <ul className="grid grid-cols-2 gap-2 rounded-[2px] border border-line bg-surface-2 p-4 sm:grid-cols-5">
            {codes.map((code) => (
              <li key={code} className="font-mono text-[12px] text-fg">
                {code}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>
            Your existing codes are stored hashed and cannot be shown again. Generate a new set if
            you have lost them.
          </EmptyState>
        )}
      </Panel>

      <Panel
        title="Sessions"
        description="Signs out every browser where you are currently signed in, including this one."
        actions={
          <ActionButton tone="danger" onClick={revoke}>
            Sign out everywhere
          </ActionButton>
        }
      >
        <p className="font-body text-[12px] font-light text-fg-muted">
          Use this if you signed in on a device you no longer control.
        </p>
      </Panel>
    </>
  );
};
