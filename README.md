# Joe Solves Tech

Landing page for an AI and no-code consulting practice for small businesses.

**Live:** https://joe-solves-tech.vercel.app

## Working on the site

The site is dependency-free and assembled by a small Node build script. Edit the
HTML in `src/sections/` and `src/partials/`, styles in `src/styles/`, and
progressive enhancements in `src/scripts/`.

```bash
npm run dev    # build, watch source files, and serve http://localhost:8000
npm run build  # create the production site in dist/
npm test       # verify the build, links, modules, and development routes
```

The comparison viewer is available at http://localhost:8000/compare/ while the
development server is running. It compares the preserved original design with
the latest generated site.

The public working demos are available at http://localhost:8000/demo/. They use
a fictional home-cleaning company and browser-local synthetic data, so visitors
can safely complete the intake-to-invoice flow, update the owner dashboard, and
use the guarded estimate assistant. The modules under `src/static/demo/js/`
separate pricing, data storage, and each experience so real services can replace
the local sandbox later without rebuilding the interface.

## Project structure

| Path | Purpose |
|---|---|
| `src/index.html` | Document shell and ordered section includes |
| `src/sections/` | Editable page content, one business section per file |
| `src/partials/` | Navigation, footer, sticky CTA, and offer reminder |
| `src/styles/` | Ordered stylesheet modules concatenated during builds |
| `src/scripts/` | Native ES modules for progressive enhancements |
| `scripts/` | Dependency-free build and local development server |
| `tools/compare/` | Development-only before/after viewer and old snapshot |
| `dist/` | Generated deployment output; intentionally ignored by Git |

## Design and resilience constraints

The five-color design system, type scale, and spacing scale live in
`src/styles/01-tokens.css`. The page remains usable without JavaScript,
respects `prefers-reduced-motion`, avoids external JavaScript libraries, and
keeps authored values visible when animation features are unavailable.

The repository lives beside private notes, so `.gitignore` intentionally
ignores everything except the explicitly public source and tooling directories.
Treat any newly allowlisted directory as public.

## Deployment

Vercel runs `npm run build` and publishes only `dist/`, as configured in
`vercel.json`. The production entry point is `dist/index.html` and is served
at `/`.

### Google Analytics

Create a GA4 web data stream, then add its measurement ID (the value beginning
with `G-`) to Vercel as an environment variable named `GA_MEASUREMENT_ID`.
Redeploy the site after saving it. The build adds the Google tag to every public
HTML page only when that variable is present.

For a local production-style check, run:

```bash
GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build
```

In addition to GA4's automatic page views, the landing page records
`contact_cta_click` when a visitor opens the contact section and the recommended
`generate_lead` event when they click an email link. No analytics requests are
made by ordinary local builds without the environment variable.

## Status

Early. The three project cards are labelled example builds rather than client
work, pricing is provisional, and the reviews section remains an intentional
empty state until there is something real to publish.
