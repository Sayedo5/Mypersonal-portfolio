import React, { useEffect, useState } from 'react';

import { ApiError, authApi } from '../api';
import { ActionButton, Banner, Field, TextInput } from '../components/ui';

/** Centred card shared by the three pre-dashboard screens. */
const AuthShell: React.FC<{
  title: string;
  intro: string;
  children: React.ReactNode;
}> = ({ title, intro, children }) => (
  <div className="grid min-h-screen place-items-center bg-bg px-5 py-10 text-fg">
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-[2px] border border-line bg-surface p-7 sm:p-9">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <span className="corner-pin left-0 top-0 border-l border-t opacity-60" />
        <span className="corner-pin right-0 top-0 border-r border-t opacity-60" />
        <span className="corner-pin bottom-0 left-0 border-b border-l opacity-60" />
        <span className="corner-pin bottom-0 right-0 border-b border-r opacity-60" />

        <h1 className="font-display text-[2rem] leading-none tracking-wide text-fg-strong">
          {title}
        </h1>
        <p className="mb-7 mt-3 font-body text-[12.5px] font-light leading-relaxed text-fg-muted">
          {intro}
        </p>

        {children}
      </div>

      <p className="mt-5 text-center font-mono text-[9.5px] uppercase tracking-[0.18em] text-fg-subtle">
        <a href="/" className="transition-colors hover:text-gold">
          ← Back to the portfolio
        </a>
      </p>
    </div>
  </div>
);

export const LoginPage: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setErrors({});
    try {
      await authApi.login(email, password);
      onSuccess();
    } catch (caught) {
      if (caught instanceof ApiError) {
        setErrors(caught.fieldErrors);
        setError(caught.message);
      } else {
        setError('Could not reach the server.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="ADMIN SIGN IN"
      intro="Owner access only. After your password you will be asked for a code from your authenticator app."
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Banner tone="error">{error}</Banner>}

        <Field label="// EMAIL" htmlFor="admin-email" errors={errors.email}>
          <TextInput
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="// PASSWORD" htmlFor="admin-password" errors={errors.password}>
          <TextInput
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <ActionButton tone="primary" type="submit" loading={busy} className="w-full justify-center">
          Continue
        </ActionButton>
      </form>
    </AuthShell>
  );
};

export const TwoFactorPage: React.FC<{ onSuccess: () => void; onSignOut: () => void }> = ({
  onSuccess,
  onSignOut,
}) => {
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (useRecovery) await authApi.verifyRecovery(recovery.trim().toUpperCase());
      else await authApi.verifyTotp(code.trim());
      onSuccess();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="TWO-FACTOR CODE"
      intro="Open your authenticator app and enter the current 6-digit code."
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Banner tone="error">{error}</Banner>}

        {useRecovery ? (
          <Field label="// RECOVERY CODE" htmlFor="recovery-code">
            <TextInput
              id="recovery-code"
              required
              autoFocus
              placeholder="XXXX-XXXXXX"
              value={recovery}
              onChange={(e) => setRecovery(e.target.value.toUpperCase())}
            />
          </Field>
        ) : (
          <Field label="// 6-DIGIT CODE" htmlFor="totp-code">
            <TextInput
              id="totp-code"
              required
              autoFocus
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="text-center font-mono tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        )}

        <ActionButton tone="primary" type="submit" loading={busy} className="w-full justify-center">
          Verify
        </ActionButton>

        <div className="flex justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setUseRecovery((value) => !value)}
            className="font-body text-[11px] text-gold hover:underline underline-offset-4"
          >
            {useRecovery ? 'Use authenticator code' : 'Use a recovery code'}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="font-body text-[11px] text-fg-subtle hover:text-fg"
          >
            Sign out
          </button>
        </div>
      </form>
    </AuthShell>
  );
};

export const EnrollPage: React.FC<{ onSuccess: () => void; onSignOut: () => void }> = ({
  onSuccess,
  onSignOut,
}) => {
  const [qr, setQr] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authApi
      .enrollStart()
      .then((data) => {
        if (!cancelled) setQr(data);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof ApiError ? caught.message : 'Could not start enrollment.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await authApi.enrollVerify(code.trim());
      setBackupCodes(result.backupCodes);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  if (backupCodes) {
    return (
      <AuthShell
        title="RECOVERY CODES"
        intro="Store these somewhere safe — a password manager is ideal. Each one works once, and they are never shown again."
      >
        <ul className="mb-6 grid grid-cols-2 gap-2 rounded-[2px] border border-line bg-surface-2 p-4">
          {backupCodes.map((backupCode) => (
            <li key={backupCode} className="font-mono text-[12px] text-fg">
              {backupCode}
            </li>
          ))}
        </ul>

        <ActionButton
          tone="primary"
          onClick={() => {
            void navigator.clipboard?.writeText(backupCodes.join('\n')).catch(() => {});
          }}
          className="mb-3 w-full justify-center"
        >
          Copy codes
        </ActionButton>

        <ActionButton onClick={onSuccess} className="w-full justify-center">
          I have saved them — continue
        </ActionButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="SET UP 2FA"
      intro="Scan this with Google Authenticator, 1Password, Authy or any TOTP app, then enter the code it shows."
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Banner tone="error">{error}</Banner>}

        {qr ? (
          <>
            <div className="flex justify-center">
              <img
                src={qr.qrDataUrl}
                alt="Two-factor setup QR code"
                className="rounded-[2px] border border-line bg-white p-2"
                width={200}
                height={200}
              />
            </div>

            <div className="rounded-[2px] border border-line bg-surface-2 p-3 text-center">
              <p className="label-mono mb-1 text-fg-subtle">// OR ENTER THIS KEY</p>
              <code className="break-all font-mono text-[11px] text-fg">{qr.secret}</code>
            </div>
          </>
        ) : (
          <p className="text-center font-body text-[12px] text-fg-subtle">Generating…</p>
        )}

        <Field label="// CODE FROM THE APP" htmlFor="enroll-code">
          <TextInput
            id="enroll-code"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono tracking-[0.5em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </Field>

        <ActionButton
          tone="primary"
          type="submit"
          loading={busy}
          disabled={!qr}
          className="w-full justify-center"
        >
          Confirm and enable
        </ActionButton>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full font-body text-[11px] text-fg-subtle hover:text-fg"
        >
          Sign out
        </button>
      </form>
    </AuthShell>
  );
};
