import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import './admin.css';

import { authApi, type SessionView } from './api';
import AdminShell from './components/AdminShell';
import { Banner } from './components/ui';
import { EnrollPage, LoginPage, TwoFactorPage } from './pages/AuthPages';
import {
  AboutPage,
  AppearancePage,
  CareerPage,
  ContactLinksPage,
  HeroPage,
  NavigationPage,
  ProfilePage,
  ProjectsPage,
  SectionsPage,
  SeoPage,
  ServicesPage,
  SkillsPage,
} from './pages/ContentPages';
import { AuditPage, InboxPage, MediaPage, OverviewPage, SecurityPage } from './pages/OpsPages';

const anonymous: SessionView = {
  authenticated: false,
  mfaPassed: false,
  needsEnrollment: false,
  user: null,
};

/**
 * Admin root.
 *
 * The gate below mirrors the reference project's guard chain exactly:
 * password → TOTP enrollment (if never set up) → TOTP code → dashboard.
 * The server enforces the same order, so the UI can never be talked past.
 */
export const AdminApp: React.FC = () => {
  const [session, setSession] = useState<SessionView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSession(await authApi.session());
      setError(null);
    } catch {
      setSession(anonymous);
      setError(
        'Could not reach the admin API. If you are running `npm run dev`, start `vercel dev` instead so the serverless functions are available.',
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep the tab title out of the portfolio's SEO title.
  useEffect(() => {
    document.title = 'Admin · Portfolio CMS';
  }, []);

  const signOut = useCallback(() => setSession(anonymous), []);

  if (!session) {
    return (
      <div className="ad">
        <div className="ad-auth">
          <p className="ad-help">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <>
        {error && (
          <div className="ad" style={{ position: 'fixed', insetInline: 16, top: 16, zIndex: 50, maxWidth: 520, marginInline: 'auto', background: 'transparent', minHeight: 0 }}>
            <Banner tone="error">{error}</Banner>
          </div>
        )}
        <LoginPage onSuccess={() => void refresh()} />
      </>
    );
  }

  if (session.needsEnrollment) {
    return <EnrollPage onSuccess={() => void refresh()} onSignOut={signOut} />;
  }

  if (!session.mfaPassed) {
    return <TwoFactorPage onSuccess={() => void refresh()} onSignOut={signOut} />;
  }

  return (
    <AdminShell session={session} onSignOut={signOut}>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="hero" element={<HeroPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="career" element={<CareerPage />} />
        <Route path="contact" element={<ContactLinksPage />} />
        <Route path="sections" element={<SectionsPage />} />
        <Route path="navigation" element={<NavigationPage />} />
        <Route path="appearance" element={<AppearancePage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="security" element={<SecurityPage onSignedOut={signOut} />} />
        {/* `/admin/login` is a bookmarkable entry point; once signed in it
            simply lands on the dashboard. */}
        <Route path="login" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminShell>
  );
};

export default AdminApp;
