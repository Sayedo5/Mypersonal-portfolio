import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import type { PortfolioContent } from '../data/content-types';
import { apiFetch } from '../lib/api';
import { fallbackContent } from './fallback';

type ContentState = {
  content: PortfolioContent;
  /** True once the live payload has replaced the bundled fallback. */
  isLive: boolean;
  refresh: () => void;
};

const ContentContext = createContext<ContentState>({
  content: fallbackContent,
  isLive: false,
  refresh: () => {},
});

/** Broadcast channel the admin panel uses to push a refetch at the site. */
const REFRESH_EVENT = 'portfolio:content-refresh';

export function requestContentRefresh(): void {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

type Props = {
  children: React.ReactNode;
  /** Owner-only: read live drafts instead of published snapshots. */
  preview?: boolean;
};

/**
 * Serves the site's content.
 *
 * It starts from the bundled fallback so the first paint is complete and
 * correct, then swaps in the published payload from `/api/content` as soon
 * as it arrives. A failed fetch is not an error state — the visitor simply
 * keeps seeing the bundled copy.
 */
export const ContentProvider: React.FC<Props> = ({ children, preview = false }) => {
  const [content, setContent] = useState<PortfolioContent>(fallbackContent);
  const [isLive, setIsLive] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    try {
      const live = await apiFetch<PortfolioContent>(
        preview ? '/api/content?preview=1' : '/api/content',
        { signal: controller.signal },
      );

      // A database that has not been seeded yet would blank the page;
      // keep the bundled copy until there is real content to show.
      if (live?.profile?.name) {
        setContent(live);
        setIsLive(true);
      }
    } catch {
      // Offline, cold database, or not deployed yet — the fallback stands.
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
    }
  }, [preview]);

  useEffect(() => {
    void load();
    return () => inFlight.current?.abort();
  }, [load]);

  // Refetch when the admin panel says something was published, and when the
  // visitor returns to the tab — this is the SPA equivalent of the cache-tag
  // invalidation a server-rendered CMS would do.
  useEffect(() => {
    const onRefresh = () => void load();
    const onFocus = () => {
      if (document.visibilityState === 'visible') void load();
    };

    window.addEventListener(REFRESH_EVENT, onRefresh);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 5000);

    return () => {
      window.removeEventListener(REFRESH_EVENT, onRefresh);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.clearInterval(poll);
    };
  }, [load]);

  return (
    <ContentContext.Provider value={{ content, isLive, refresh: () => void load() }}>
      {children}
    </ContentContext.Provider>
  );
};

export function useContent(): PortfolioContent {
  return useContext(ContentContext).content;
}

export function useContentState(): ContentState {
  return useContext(ContentContext);
}

/** Section header copy by key, with the bundled copy as a safety net. */
export function useSection(key: string) {
  const content = useContent();
  return content.sections[key] ?? fallbackContent.sections[key];
}
