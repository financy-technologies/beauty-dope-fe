# Skinevora blog — Sanity Studio

Where blog posts are written. Project `ypv8c2yu`, dataset `skinevora-production` (private).

```sh
cd studio
npm install
npm run dev       # http://localhost:3333 — sign in with your Sanity account
npm run deploy    # host it at https://<name>.sanity.studio (asks for a name the first time)
```

Editors sign in with their own Sanity accounts (invite them under Members at
sanity.io/manage). No token is needed to use the Studio.

## How posts reach the site

Studio → Sanity → API (`beauty-dope-be/src/blog`, reads with `SANITY_API_TOKEN`)
→ site (`/blog`, `/blog/<slug>`). The API caches for 60 seconds, so a publish
shows up within a minute or two. A post appears only once it's **published**
and its **publish date** has passed. Drafts are never shown.

New posts are prerendered and added to `sitemap.xml` on the next frontend
deploy. Until then they still work, rendered in the browser.

## Changing the schema

Block types in `schemaTypes/blocks.ts` map 1:1 to components in
`../src/components/blog/blocks.tsx`. Tag colours map to `../src/lib/blog.ts`.
When you add a block type, add its component too; until then the site skips it.

## One-off: importing the old hard-coded posts

Already done on 2026-11-09. Kept for reference; re-running skips existing posts.

```sh
SANITY_WRITE_TOKEN=<token with write access> npm run import-legacy               # dry run
SANITY_WRITE_TOKEN=<token with write access> npm run import-legacy -- --commit
```
