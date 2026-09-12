import React, { useEffect, useState } from 'react';

import { ApiError, authApi } from '../api';
import { useAdminTheme } from '../useAdminTheme';
import { ActionButton, Banner, Field, TextInput } from '../components/ui';

/** Centred card shared by the three pre-dashboard screens. */
const AuthShell: React.FC<{
  title: string;
  intro: string;
  children: React.ReactNode;
}> = ({ title, intro, children }) => {
  const { theme } = useAdminTheme();

  return (
    <div className="ad" data-ad-theme={theme}>
      <div className="ad-auth">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="ad-auth-card">
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}
            >
              <span className="ad-brand-mark">SM</span>
              <span className="ad-brand-name">Portfolio CMS</span>
            </div>

            <h1 className="ad-auth-title">{title}</h1>
            <p className="ad-auth-intro">{intro}</p>

            {children}
          </div>

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/" className="ad-link">
              ← Back to the portfolio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

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
      title="Sign in"
      intro="Owner access only. After your password you will be asked for a code from your authenticator app."
    >
      <form onSubmit={submit} className="ad-stack">
        {error && <Banner tone="error">{error}</Banner>}

        <Field label="Email" htmlFor="admin-email" errors={errors.email}>
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

        <Field label="Password" htmlFor="admin-password" errors={errors.password}>
          <TextInput
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <ActionButton tone="primary" type="submit" loading={busy} className="ad-btn--block">
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
      title="Two-factor code"
      intro="Open your authenticator app and enter the current 6-digit code."
    >
      <form onSubmit={submit} className="ad-stack">
        {error && <Banner tone="error">{error}</Banner>}

        {useRecovery ? (
          <Field label="Recovery code" htmlFor="recovery-code">
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
          <Field label="6-digit code" htmlFor="totp-code">
            <TextInput
              id="totp-code"
              required
              autoFocus
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="ad-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        )}

        <ActionButton tone="primary" type="submit" loading={busy} className="ad-btn--block">
          Verify
        </ActionButton>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button type="button" onClick={() => setUseRecovery((v) => !v)} className="ad-link">
            {useRecovery ? 'Use authenticator code' : 'Use a recovery code'}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="ad-link"
            style={{ color: 'var(--ad-text-muted)' }}
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
        title="Recovery codes"
        intro="Store these somewhere safe — a password manager is ideal. Each one works once, and they are never shown again."
      >
        <ul className="ad-codes">
          {backupCodes.map((backupCode) => (
            <li key={backupCode}>{backupCode}</li>
          ))}
        </ul>

        <div className="ad-stack">
          <ActionButton
            onClick={() => {
              void navigator.clipboard?.writeText(backupCodes.join('\n')).catch(() => {});
            }}
            className="ad-btn--block"
          >
            Copy codes
          </ActionButton>
          <ActionButton tone="primary" onClick={onSuccess} className="ad-btn--block">
            I have saved them — continue
          </ActionButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set up two-factor"
      intro="Scan this with Google Authenticator, 1Password, Authy or any TOTP app, then enter the code it shows."
    >
      <form onSubmit={submit} className="ad-stack">
        {error && <Banner tone="error">{error}</Banner>}

        {qr ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={qr.qrDataUrl}
                alt="Two-factor setup QR code"
                width={190}
                height={190}
                style={{ background: '#fff', padding: 8, borderRadius: 10 }}
              />
            </div>

            <div
              style={{
                textAlign: 'center',
                padding: 12,
                background: 'var(--ad-surface-2)',
                border: '1px solid var(--ad-border)',
                borderRadius: 8,
              }}
            >
              <p className="ad-help" style={{ marginTop: 0 }}>
                Or enter this key manually
              </p>
              <code className="ad-mono" style={{ wordBreak: 'break-all' }}>
                {qr.secret}
              </code>
            </div>
          </>
        ) : (
          <p className="ad-help" style={{ textAlign: 'center' }}>
            Generating…
          </p>
        )}

        <Field label="Code from the app" htmlFor="enroll-code">
          <TextInput
            id="enroll-code"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="ad-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </Field>

        <ActionButton
          tone="primary"
          type="submit"
          loading={busy}
          disabled={!qr}
          className="ad-btn--block"
        >
          Confirm and enable
        </ActionButton>

        <button
          type="button"
          onClick={onSignOut}
          className="ad-link"
          style={{ color: 'var(--ad-text-muted)' }}
        >
          Sign out
        </button>
      </form>
    </AuthShell>
  );
};
