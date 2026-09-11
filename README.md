# Sayed Muhammad — Portfolio

Personal portfolio site. React 19 + TypeScript + Vite + Tailwind CSS v4, with a
dark/light theme, a cinematic gold treatment, and Framer Motion for the motion work.

```bash
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run typecheck  # TypeScript, no emit
npm run lint       # oxlint
```

---

## Things you need to replace

These are the only files holding placeholder or borrowed assets. Swap them and the
site is fully yours — no code changes needed, just keep the filenames the same.

| What | File | Notes |
|---|---|---|
| Hero video (the moving clip) | `public/videos/hero.mp4` | Currently 2.4 MB. Keep under ~5 MB. |
| Your photo (About section) | `src/assets/about.jpg` | **Currently 1.6 MB — compress it.** Portrait 4:5, e.g. 800×1000, target 200–300 KB. |
| Your CV | `public/resume.pdf` | **Not present yet.** The "Download resume" buttons 404 until you add it. |
| Social preview image | `public/og-image.png` | Optional. 1200×630. Shows when the link is shared. |
| Emblem watermark | `src/assets/watermark.png` | Came with the template — replace or delete if you don't want it. |

> Compress images at [tinypng.com](https://tinypng.com). The 1.6 MB photo is
> currently the single biggest file on the site and will hurt your Lighthouse score.

---

## Editing your content

**All copy lives in one file: `src/data/profile.ts`.** Nothing is hardcoded in the
components. Edit that file and everything updates — hero, about, services, projects,
skills, experience, contact, and the structured data.

| Export | Drives |
|---|---|
| `profile` | Name, role, location, email, phone, GitHub, LinkedIn, bio |
| `terminalLines` | Rotating `$ ...` phrases in the hero |
| `stats` | The four big numbers in About |
| `services` | The three "what I build for clients" panels |
| `guarantees` | The four "what you get every time" boxes |
| `projects` | Project cards (add `liveUrl` to show a "View live site" button) |
| `skillBlocks` | The tech matrix bento grid |
| `journey` | Experience + education timeline |

Your name, job title and links are **also** in `index.html` — in the `<title>`, the
meta description, the Open Graph tags, and the JSON-LD block that Google reads.
Update those too when details change.

---

## Theme

A sun/moon button sits in the header. It writes to `localStorage` and follows the
visitor's OS preference until they pick one explicitly. An inline script in
`index.html` applies the theme before first paint, so there's no flash.

Every colour is a CSS variable in `src/index.css`, defined twice — once under
`:root` (dark) and once under `[data-theme='light']`. Tailwind utilities like
`bg-surface` and `text-gold` resolve through those variables, so changing a brand
colour is a one-line edit in two places.

## Buttons and fonts

- **Buttons** — use `<ButtonLink>` / `<Button>` from `src/components/Button.tsx`.
  Three variants: `primary` (solid gold), `outline`, `ghost`. Don't hand-roll a
  button; these keep padding, radius, hover and focus identical everywhere.
- **Section headers** — use `<SectionHeader>` so every eyebrow and headline shares
  one type scale.
- **Fonts** — four roles, registered as Tailwind classes:
  `font-display` (Bebas Neue, headlines), `font-body` (Montserrat, prose),
  `font-mono` (JetBrains Mono, labels/metrics), `font-script` (signature only).

---

## Contact form

By default the form opens the visitor's mail client with the message pre-filled —
it works with zero setup and never silently loses an enquiry.

To receive submissions directly instead, create a free [Formspree](https://formspree.io)
form and add a `.env` file:

```
VITE_CONTACT_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

Rebuild and the form POSTs there instead.

---

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import that repo.
3. Vercel detects Vite automatically (build `npm run build`, output `dist`). Deploy.
4. If you set `VITE_CONTACT_ENDPOINT`, add it under **Settings → Environment Variables**.

**After you have a real domain,** replace `https://sayedmuhammad.dev/` everywhere in
`index.html` (canonical link, `og:url`, image URLs) and `siteUrl` in
`src/data/profile.ts` — otherwise link previews and SEO point at a domain you don't own.

---

## Accessibility notes

Skip link, visible keyboard focus rings, labelled form fields, `aria-expanded` on the
mobile menu, and `prefers-reduced-motion` support throughout. Keep these if you edit
the components — they're a real part of the "senior developer" signal.
