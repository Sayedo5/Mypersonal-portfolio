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

        <div className="ad-stat-grid">
          {tiles.map((tile) => {
            const body = (
              <>
                <span className="ad-stat-value">
                  {tile.value}
                </span>
                <span className="ad-stat-label">
                  {tile.label}
                </span>
              </>
            );

            return tile.to ? (
              <Link
                key={tile.label}
                to={tile.to}
                className="ad-stat"
              >
                {body}
              </Link>
            ) : (
              <div key={tile.label} className="ad-stat">
                {body}
              </div>
            );
          })}
        </div>

        {data && (
          <p className="ad-help" style={{ marginTop: 14 }}>
            Last publish: {formatDate(data.lastPublishedAt)}
          </p>
        )}
      </Panel>

      <Panel title="Recent activity" description="Every administrative change is recorded.">
        {!data ? (
          <p className="ad-help">Loading…</p>
        ) : data.recentEvents.length === 0 ? (
          <EmptyState>No activity yet.</EmptyState>
        ) : (
          <ul className="ad-list">
            {data.recentEvents.map((event) => (
              <li key={event.id} className="ad-item" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 12px" }}>
                <span className="ad-item-title">
                  <span style={{ color: "var(--ad-primary)" }}>{event.action}</span> · {event.entityType}
                </span>
                <span className="ad-mono" style={{ color: "var(--ad-text-muted)" }}>
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
            style={{ display: 'none' }}
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
        <div style={{ marginBottom: 18 }}>
          <Banner tone={banner.tone}>{banner.text}</Banner>
        </div>
      )}

      {assets.length === 0 ? (
        <EmptyState>No files yet. Upload an image, a PDF or an MP4 to get started.</EmptyState>
      ) : (
        <ul className="ad-media-grid">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="ad-media-item"
            >
              <div className="ad-row">
                {asset.kind === 'IMAGE' ? (
                  <img
                    src={asset.publicUrl}
                    alt=""
                    className="ad-thumb"
                  />
                ) : (
                  <span className="ad-thumb ad-thumb--doc">
                    {asset.kind}
                  </span>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="ad-item-title">{asset.originalName}</p>
                  <p className="ad-mono" style={{ color: "var(--ad-text-muted)" }}>
                    {(asset.byteSize / 1024).toFixed(0)} KB
                  </p>
                  <a
                    href={asset.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-link"
                  >
                    Open ↗
                  </a>
                </div>
              </div>

              <Field label="Alt text">
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
        <div style={{ display: "flex", gap: 4 }}>
          {(['ALL', 'UNREAD', 'READ', 'ARCHIVED'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`ad-btn ${filter === value ? "ad-btn--primary" : ""}`}
            >
              {value}
            </button>
          ))}
        </div>
      }
    >
      {banner && (
        <div style={{ marginBottom: 18 }}>
          <Banner tone="error">{banner}</Banner>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState>Nothing here.</EmptyState>
      ) : (
        <ul className="ad-list">
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <li key={message.id} className="ad-item">
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(open ? null : message.id);
                    if (!open && message.status === 'UNREAD') void setStatus(message.id, 'READ');
                  }}
                  className="ad-item-toggle" style={{ width: "100%", padding: "10px 12px", flexWrap: "wrap", justifyContent: "space-between" }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span className="ad-item-title" style={{ display: "block" }}>
                      {message.name}{' '}
                      <span style={{ color: "var(--ad-text-muted)" }}>· {message.email}</span>
                    </span>
                    <span className="ad-item-sub" style={{ display: "block" }}>
                      {message.subject ?? 'Project enquiry'}
                    </span>
                  </span>

                  <span style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {message.status === 'UNREAD' && (
                      <span className="ad-chip ad-chip--info">New</span>
                    )}
                    <span className="ad-mono" style={{ color: "var(--ad-text-muted)" }}>
                      {formatDate(message.createdAt)}
                    </span>
                  </span>
                </button>

                {open && (
                  <div className="ad-item-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {message.company && (
                      <p className="ad-help" style={{ marginTop: 0 }}>
                        Company: {message.company}
                      </p>
                    )}
                    <p style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, color: "var(--ad-text-soft)" }}>
                      {message.message}
                    </p>

                    <div className="ad-actions">
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
        <div className="ad-scroll-x">
          <table className="ad-table" style={{ minWidth: 540 }}>
            <thead>
              <tr>
                {['Action', 'Entity', 'By', 'When'].map((heading) => (
                  <th key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="ad-mono" style={{ color: "var(--ad-primary)" }}>{event.action}</td>
                  <td>
                    {event.entityType}
                  </td>
                  <td>
                    {event.ownerUser?.name ?? 'system'}
                  </td>
                  <td className="ad-mono">
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

        <form onSubmit={changePassword} className="ad-stack" style={{ maxWidth: 460 }}>
          <Field label="Current password" errors={errors.currentPassword}>
            <TextInput
              type="password"
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </Field>

          <Field
            label="New password"
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

          <Field label="Confirm new password" errors={errors.confirmPassword}>
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
          <ul className="ad-codes" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
            {codes.map((code) => (
              <li key={code}>
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
        <p className="ad-help" style={{ marginTop: 0 }}>
          Use this if you signed in on a device you no longer control.
        </p>
      </Panel>
    </>
  );
};
