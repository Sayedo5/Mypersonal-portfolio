/** Thin fetch wrapper over the `/api` serverless functions. */

export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.fieldErrors = body.fieldErrors ?? {};
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  const response = await fetch(path, {
    method,
    // The session lives in an httpOnly cookie; it must ride along.
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError(response.status, {
        code: 'UNEXPECTED',
        message: 'The server returned an unreadable response.',
      });
    }
  }

  const envelope = payload as { ok?: boolean; data?: T; error?: ApiErrorBody } | null;

  if (!response.ok || !envelope?.ok) {
    throw new ApiError(
      response.status,
      envelope?.error ?? { code: 'UNEXPECTED', message: 'Something went wrong.' },
    );
  }

  return envelope.data as T;
}
