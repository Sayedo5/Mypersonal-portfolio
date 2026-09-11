import { useEffect } from 'react';

import { useContentState } from './ContentProvider';

function setMeta(selector: string, attribute: 'name' | 'property', key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
}

/**
 * Keeps the document head in step with the SEO fields managed in the admin
 * panel. `index.html` still ships the correct tags for crawlers that do not
 * run JavaScript, so this only ever refines what is already there — it never
 * leaves the head empty while the fetch is in flight.
 */
export const DocumentHead: React.FC = () => {
  const { content, isLive } = useContentState();

  useEffect(() => {
    // Until the live payload lands, the tags baked into index.html stand.
    if (!isLive) return;

    const { site, theme } = content;

    if (site.defaultSeoTitle) {
      document.title = site.defaultSeoTitle;
      setMeta('meta[property="og:title"]', 'property', 'og:title', site.defaultSeoTitle);
      setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', site.defaultSeoTitle);
    }

    if (site.defaultSeoDescription) {
      setMeta('meta[name="description"]', 'name', 'description', site.defaultSeoDescription);
      setMeta(
        'meta[property="og:description"]',
        'property',
        'og:description',
        site.defaultSeoDescription,
      );
      setMeta(
        'meta[name="twitter:description"]',
        'name',
        'twitter:description',
        site.defaultSeoDescription,
      );
    }

    if (site.defaultSeoKeywords.length) {
      setMeta('meta[name="keywords"]', 'name', 'keywords', site.defaultSeoKeywords.join(', '));
    }

    if (site.canonicalUrl) {
      setLink('canonical', site.canonicalUrl);
      setMeta('meta[property="og:url"]', 'property', 'og:url', site.canonicalUrl);
    }

    const ogImage = site.ogImageUrl ?? theme.socialUrl;
    if (ogImage) {
      setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }

    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      site.allowIndexing ? 'index, follow' : 'noindex, nofollow',
    );

    if (theme.faviconUrl) {
      setLink('icon', theme.faviconUrl);
    }

    if (site.structuredData) {
      let script = document.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      );
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(site.structuredData);
    }
  }, [content, isLive]);

  return null;
};

export default DocumentHead;
