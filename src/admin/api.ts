import { ApiError, apiFetch } from '../lib/api';

export { ApiError };

export type SessionView = {
  authenticated: boolean;
  mfaPassed: boolean;
  needsEnrollment: boolean;
  user: { id: string; name: string; email: string } | null;
};

/** A row as the admin list/form screens see it. */
export type AdminRow = Record<string, unknown> & {
  id: string;
  publishedAt?: string | null;
  hasUnpublishedChanges?: boolean;
};

const auth = (action: string) => `/api/auth/${action}`;

/**
 * The admin endpoint is addressed by query parameter, not path segment:
 * Vercel resolves only one dynamic segment for a non-Next project, so
 * `/api/admin/hero/publish` never reached the function.
 */
const admin = (
  resource: string,
  options: { id?: string; action?: string; query?: Record<string, string> } = {},
) => {
  const params = new URLSearchParams({ resource });
  if (options.id) params.set('id', options.id);
  if (options.action) params.set('action', options.action);
  for (const [key, value] of Object.entries(options.query ?? {})) params.set(key, value);
  return `/api/admin?${params.toString()}`;
};

export const authApi = {
  session: () => apiFetch<SessionView>(auth('session')),
  login: (email: string, password: string) =>
    apiFetch<SessionView>(auth('login'), { method: 'POST', body: { email, password } }),
  logout: () => apiFetch<SessionView>(auth('logout'), { method: 'POST' }),
  enrollStart: () =>
    apiFetch<{ secret: string; qrDataUrl: string }>(auth('enroll-start'), { method: 'POST' }),
  enrollVerify: (code: string) =>
    apiFetch<{ backupCodes: string[] }>(auth('enroll-verify'), { method: 'POST', body: { code } }),
  verifyTotp: (code: string) =>
    apiFetch<{ mfaPassed: boolean }>(auth('two-factor'), { method: 'POST', body: { code } }),
  verifyRecovery: (recoveryCode: string) =>
    apiFetch<{ mfaPassed: boolean }>(auth('two-factor'), { method: 'POST', body: { recoveryCode } }),
  changePassword: (body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiFetch<{ changed: boolean }>(auth('change-password'), { method: 'POST', body }),
  regenerateCodes: () =>
    apiFetch<{ backupCodes: string[] }>(auth('regenerate-codes'), { method: 'POST' }),
  revokeSessions: () => apiFetch<SessionView>(auth('revoke-sessions'), { method: 'POST' }),
};

export const adminApi = {
  overview: () =>
    apiFetch<{
      draftCount: number;
      projectCount: number;
      mediaCount: number;
      unreadMessageCount: number;
      lastPublishedAt: string | null;
      recentEvents: {
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        createdAt: string;
      }[];
      owner: { id: string; name: string; email: string };
    }>(admin('overview')),

  get: <T = AdminRow>(entity: string) => apiFetch<T>(admin(entity)),
  list: <T = AdminRow>(entity: string) => apiFetch<T[]>(admin(entity)),
  one: <T = AdminRow>(entity: string, id: string) => apiFetch<T>(admin(entity, { id })),

  updateSingleton: <T = AdminRow>(entity: string, body: unknown) =>
    apiFetch<T>(admin(entity), { method: 'PUT', body }),
  create: <T = AdminRow>(entity: string, body: unknown) =>
    apiFetch<T>(admin(entity), { method: 'POST', body }),
  update: <T = AdminRow>(entity: string, id: string, body: unknown) =>
    apiFetch<T>(admin(entity, { id }), { method: 'PUT', body }),
  remove: (entity: string, id: string) =>
    apiFetch<{ deleted: boolean }>(admin(entity, { id }), { method: 'DELETE' }),
  reorder: (entity: string, ids: string[]) =>
    apiFetch<{ reordered: number }>(admin(entity, { action: 'reorder' }), { method: 'POST', body: { ids } }),

  publishSingleton: (entity: string) =>
    apiFetch<{ id: string; publishedAt: string }>(admin(entity, { action: 'publish' }), { method: 'POST' }),
  publishRow: (entity: string, id: string) =>
    apiFetch<{ id: string; publishedAt: string }>(admin(entity, { id, action: 'publish' }), {
      method: 'POST',
    }),
  publishAll: () =>
    apiFetch<{ published: number; publishedAt: string }>(admin('publish-all'), { method: 'POST' }),

  media: {
    list: () =>
      apiFetch<
        {
          id: string;
          kind: string;
          publicUrl: string;
          originalName: string;
          mimeType: string;
          byteSize: number;
          altText: string | null;
          createdAt: string;
        }[]
      >(admin('media')),
    uploadToken: () =>
      apiFetch<{ token: string; allowedContentTypes: string[]; pathPrefix: string }>(
        admin('media', { action: 'upload-token' }),
        { method: 'POST' },
      ),
    register: (body: {
      storageKey: string;
      publicUrl: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
      altText: string | null;
    }) => apiFetch<{ id: string; publicUrl: string }>(admin('media'), { method: 'POST', body }),
    setAlt: (id: string, altText: string | null) =>
      apiFetch(admin('media', { id }), { method: 'PUT', body: { altText } }),
    remove: (id: string) => apiFetch(admin('media', { id }), { method: 'DELETE' }),
  },

  inbox: {
    list: (status = 'ALL') =>
      apiFetch<
        {
          id: string;
          name: string;
          email: string;
          company: string | null;
          subject: string | null;
          message: string;
          status: 'UNREAD' | 'READ' | 'ARCHIVED';
          createdAt: string;
        }[]
      >(admin('inbox', { query: { status } })),
    setStatus: (id: string, status: 'UNREAD' | 'READ' | 'ARCHIVED') =>
      apiFetch(admin('inbox', { id }), { method: 'PUT', body: { status } }),
    remove: (id: string) => apiFetch(admin('inbox', { id }), { method: 'DELETE' }),
  },

  audit: (take = 100) =>
    apiFetch<
      {
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        createdAt: string;
        ownerUser: { name: string; email: string } | null;
      }[]
    >(admin('audit', { query: { take: String(take) } })),
};
