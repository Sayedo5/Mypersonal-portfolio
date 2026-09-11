# Sayed Muhammad — Portfolio + Admin CMS

Personal portfolio site with a database-backed admin panel. React 19 + TypeScript +
Vite + Tailwind CSS v4 on the front, Vercel serverless functions + Prisma 7 + Neon
Postgres behind it. Dark/light theme, cinematic gold treatment, Framer Motion.

Every piece of copy, every image, every link and every list on the site is editable
at `/admin` — no redeploy needed.

```bash
npm install
npm run dev              # Vite only: the site, using the bundled fallback content
npm run dev:full         # vercel dev: the site AND the /api functions + admin panel
npm run build            # production build into dist/
npm run preview          # serve the production build
npm run typecheck        # TypeScript across src, api and prisma
npm run lint             # oxlint

npm run db:migrate       # create/apply migrations (development)
npm run db:seed          # load the current site copy into the database
npm run admin:bootstrap  # create the single owner account
npm run db:studio        # browse the database
```

---

## First-time setup

### 1. Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) and create a project (the free tier is
   enough). **Use your own project — never a colleague’s.**
2. Open **Connection Details** on the project dashboard and copy **two** strings:
   - the **Pooled** connection (its host contains `-pooler`) → `DATABASE_URL`
   - the **Direct** connection (no `-pooler`) → `DIRECT_URL`

The pooled string is what the serverless functions use; a direct connection would
leak a Postgres backend on every invocation. The direct string is used only by
`prisma migrate` and the seed.

### 2. Fill in `.env`

Copy `.env.example` to `.env` and set every value. Generate the session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Create the schema, load your content, create your account

```bash
npm run db:migrate       # creates the tables
npm run db:seed          # loads the site exactly as it reads today
npm run admin:bootstrap  # creates the owner account from ADMIN_* in .env
```

The seed is a lift-and-shift of the current copy, so the first page load after
seeding is identical to what is live now. It is idempotent — re-running it restores
the seeded rows and leaves anything you created yourself alone.

### 4. Sign in

```bash
npm run dev:full
```

Open <http://localhost:3000/admin/login>. The first sign-in forces two-factor
enrollment: scan the QR code with Google Authenticator (or 1Password, Authy, any
TOTP app) and **save the ten recovery codes** — they are stored hashed and are never
shown again.

Once that is done, remove `ADMIN_INITIAL_PASSWORD` from your hosted environment.

> `npm run dev` runs Vite alone. The site renders perfectly from the bundled
> fallback content, but `/api` does not exist, so the admin panel cannot sign in.
> Use `npm run dev:full` (needs `npm i -g vercel`) when you want the admin panel.

---

## The admin panel

At `/admin`, behind password + mandatory TOTP.

| Screen | Edits |
|---|---|
| **Overview** | Draft count, project count, unread messages, recent activity |
| **Profile** | Name, initials, title, location, email, phone, biography, About bullets, contact pitch |
| **Hero** | Both headline lines, availability pill, role line, paragraph, both buttons, side quote, typewriter lines |
| **About & stats** | The four headline metrics |
| **Services** | Service cards and the delivery-guarantee strip |
| **Projects** | Cards, tech chips, metrics, links, plus optional case-study fields and highlights |
| **Skills** | The bento cards and every chip inside them |
| **Career** | Experience and education on one timeline, with optional achievement bullets |
| **Contact links** | Email, phone, GitHub, LinkedIn — and any others you add |
| **Sections** | Every eyebrow and two-line headline |
| **Navigation** | The header menu |
| **Appearance** | Default theme, accent colours, portrait, watermark, hero video, favicon, logo |
| **Media** | Upload images, the resume PDF and video to Vercel Blob |
| **SEO** | Title, description, keywords, share image, indexing, footer credit, JSON-LD |
| **Inbox** | Contact form submissions |
| **Audit** | Every administrative action, with secrets redacted |
| **Security** | Change password, regenerate recovery codes, sign out everywhere |

### Draft → Publish

Saving writes a **draft**. The live site keeps showing the last **published**
snapshot until you press **Publish** on that section, or **Publish all** in the
header. Check a draft first at `/preview` — owner-only and never indexed.

### How edits reach the live site

`/api/content` is served `no-store`, and the portfolio refetches it on load and
whenever the tab regains focus. Publish, then refresh the site — the change is there.
No redeploy, no build step.

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

**Day to day, edit at `/admin`.** The table below describes the fallback copy that
is bundled into the build.

`src/data/profile.ts` is no longer what the live site reads — it is the **fallback**.
It paints on the first frame before the database responds, and it is what renders if
Neon is ever unreachable. Keeping it roughly in sync is worthwhile but not required;
`npm run db:seed` reads from it, so it is also the source for a fresh database.

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

`index.html` still carries the title, meta description, Open Graph tags and JSON-LD.
Those are the crawler fallback for bots that do not run JavaScript; the SEO screen in
the admin panel overwrites them client-side once the live content loads.

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

Submissions POST to `/api/contact` and land in the **Inbox** screen of the admin
panel. Protected by a honeypot field and a per-IP hourly rate limit; only a one-way
hash of the address is stored, never the address itself.

If `/api` is unreachable the form falls back to opening the visitor's mail client
with the message pre-filled, so an enquiry is never silently lost.

Setting `VITE_CONTACT_ENDPOINT` to a [Formspree](https://formspree.io) URL overrides
the built-in inbox.

---

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import that repo.
3. Under **Settings → Environment Variables** add, for Production and Preview:
   `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `SITE_URL`, `TOTP_ISSUER`,
   `MEDIA_PROVIDER=vercel-blob`, plus `ADMIN_NAME` / `ADMIN_EMAIL` /
   `ADMIN_INITIAL_PASSWORD` for the first bootstrap only.
4. Under **Storage**, create a **Blob** store and connect it to the project. Vercel
   injects `BLOB_READ_WRITE_TOKEN` automatically.
5. Deploy. `prisma generate` runs in `postinstall`, and `vercel.json` handles the SPA
   rewrite so `/admin` does not 404 on a hard refresh.
6. Run `npm run db:migrate:deploy` and `npm run admin:bootstrap` once against the
   production database, then delete `ADMIN_INITIAL_PASSWORD` and redeploy.

The four serverless functions are `/api/content`, `/api/contact`,
`/api/auth/[action]` and `/api/admin/[...route]` — comfortably inside the Hobby
plan's twelve-function limit.

### The SPA rewrite in `vercel.json`

```
/((?!api/|assets/|src/|node_modules/|@|.*.).*)  ->  /index.html
```

This sends client-side routes (`/admin`, `/admin/login`, `/preview`) to the SPA. The
exclusions matter and must not be trimmed:

| Excluded | Why |
|---|---|
| `api/` | the serverless functions |
| `assets/` | the built bundle |
| `src/`, `node_modules/`, `@…` | how Vite serves modules during `vercel dev` |
| `.*.` (any path with a dot) | every static file — hero.mp4, favicon.svg, resume.pdf |

Drop the `src/`, `node_modules/` or `@` exclusions and `vercel dev` breaks with
*"Failed to parse source for import analysis because the content contains invalid JS
syntax"* pointing at `index.html` — because the rewrite returns HTML for a request
Vite expects to be JavaScript.

`vercel.json` is strict JSON: Vercel rejects unknown keys such as `_comment`.

**After you have a real domain,** replace `https://syedmuhammad.dev/` everywhere in
`index.html` (canonical link, `og:url`, image URLs) and `siteUrl` in
`src/data/profile.ts` — otherwise link previews and SEO point at a domain you don't own.

---

## Accessibility notes

Skip link, visible keyboard focus rings, labelled form fields, `aria-expanded` on the
mobile menu, and `prefers-reduced-motion` support throughout. Keep these if you edit
the components — they're a real part of the "senior developer" signal.
