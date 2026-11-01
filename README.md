# Vinay Kumar - Engineering fieldnotes

A complete, original Angular portfolio at `C:\Documents\vinay-portfolio`, built from the owner's supplied resume. The owner has created a Vercel deployment; its build/output repair and exact settings are documented in `docs\deployment.md`.

The warm paper, dark green, sage, and citron design uses editorial typography and original geometric artwork. It puts professional contributions ahead of decorative effects, with a readable single-column mobile layout.

## What is included

- A homepage with an introduction, four selected work summaries, four-role experience timeline, expertise, AI-assisted engineering note, about, education, qualifications, contact, and footer.
- Four individually addressable professional project pages, next-project navigation, browser history support, and a useful not-found page with real HTTP 404 responses.
- Responsive navigation, active-section tracking, a keyboard skip link, routed heading focus, reduced-motion support, and an accessible reload/dismiss notice when a project bundle fails to load.
- Direct email, the source-provided LinkedIn link, real clipboard feedback, and **Download resume PDF** links in the hero and About sections. Downloads use the owner's approved, unchanged PDF and work without JavaScript.
- Prerendered HTML, self-hosted fonts, an original favicon and social image, conditional canonical/social URLs and sitemap, production security headers, and publication checks.

The project summaries describe resume-listed work at Giesecke+Devrient, Ticketmaster, Smart Energy Water, and Capgemini. They are not invented side projects or claims of ownership of those companies' systems.

## Start locally

Use **Node.js 24.19.0 and npm 12.0.2**, the verified versions. The project accepts compatible Node 24 releases from 24.15.0; `.node-version` records the tested version. A .NET SDK, Python, database, email account integration, and global Angular CLI are not required.

Release check on 31 October 2026: Angular **22.2.4** and CLI/build/SSR **22.2.5** match the npm registry's latest stable releases. The installed Node **24.19.0** is compatible, but not the newest release: the latest LTS is **26.13.0**, and the latest Node 24 patch is **24.22.2**, according to the [official release index](https://nodejs.org/dist/index.json). This change does not upgrade the machine-wide Node installation.

From PowerShell:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npm ci
npm start
```

Open **http://127.0.0.1:4200/**. The existing working copy already has dependencies installed; `npm ci` is the reproducible installation command for a fresh copy. Stop a server you started with `Ctrl+C`. Both supplied servers bind only to loopback.

For the finalized production build:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npm run build
npm run preview
```

Open **http://127.0.0.1:4173/**. Do not open `index.html` through `file://`. Restart a manual preview after rebuilding so it reloads the generated security headers.

**Use `npm run build`, not bare `ng build`, for deployable output.** The npm wrapper checks public assets, creates `404.html`, generates headers and robots rules, and includes dependency notices. `npm start` and `npm run watch` are development tools, not finalized deployment builds.

## Tests and checks

Install Playwright's matching test browser once per machine:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npx playwright install chromium
npm run verify
```

`verify` runs lint, formatting, strict type checks, Angular tests, Node tooling tests, the production build, and browser tests. The browser suite starts and stops its own preview on port 4173 by default. If that port is occupied, set `$env:PORT = '4174'` to an unused local port before running the checks, or stop only a preview you started yourself.

Individual commands:

```powershell
npm test
npm run test:tooling
npm run lint
npm run typecheck
npm run format:check
npm run build
npm run test:e2e
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
```

Run `test:e2e` against a fresh `npm run build` after source/configuration changes. `npm run test:watch` is available for interactive unit-test development; `npm run format` applies the configured formatter.

If a managed Windows machine reports a certificate-chain error while downloading Chromium, use its trusted certificate store in the same terminal, then retry:

```powershell
$env:NODE_USE_SYSTEM_CA = '1'
npx playwright install chromium
```

This is a terminal-local setting; it does not disable TLS verification or change browser policy. Do not work around policy by disabling certificate verification. The managed Edge browser here rejected automation, so the tests use Playwright's separate Chromium installation.

### Recorded result - 31 October 2026

**48 tests passed:** 18 Angular tests, 7 Node tooling tests, and 23 production Chromium tests. Lint, formatting, strict type checks, and production build passed. Both dependency audits recorded zero known vulnerabilities; dependencies were unchanged by the PDF feature. Browser checks covered 320, 375, 768, 1024, and 1440 pixels, keyboard/touch navigation, accessibility, deep links, error recovery, assets, and headers. Real resume downloads from both entry points matched the approved PDF byte for byte; keyboard/no-JavaScript and touch downloads also passed.

The production build contains six prerendered routes plus a real 404 and the approved 70,810-byte PDF, with a 332.83 kB initial JS/CSS bundle and an Angular CLI estimated compressed transfer of 89.52 kB. This estimate is not total page weight or a field-performance score.

Full evidence, reviewed failures, and untested environments are recorded in `docs\verification.md`.

## Stack and architecture

| Area                             | Actual implementation                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Angular runtime/compiler         | 22.2.4                                                                                        |
| Angular CLI, build, prerendering | 22.2.5                                                                                        |
| TypeScript                       | 6.0.3, strict application/templates/test configuration                                        |
| UI                               | Standalone/OnPush components, signals, Angular Router, SCSS                                   |
| Runtime helpers                  | RxJS 7.8.2, tslib 2.9.1                                                                       |
| Typography                       | Fontsource DM Sans Variable 5.3.0, IBM Plex Mono 5.3.0; system Georgia for editorial emphasis |
| Unit/tooling tests               | Vitest 5.0.5, jsdom 30.1.3, Node's built-in test runner                                       |
| Browser/accessibility tests      | Playwright 1.64.1, axe Playwright integration 4.14.0                                          |
| Code quality                     | Angular ESLint 22.6.0, ESLint 10.14.0, typescript-eslint 8.71.0, Prettier 3.9.10              |

Angular prerenders the homepage and project routes at build time, then hydrates them for client-side navigation. Typed local data supplies the professional content. The shared shell owns navigation and focus; page/section components own presentation; small services own metadata and clipboard behavior.

**No application backend is necessary.** Static content and direct email need no API, authentication, database, SMTP provider, server-side message storage, or application CORS policy. The Node preview utility and Angular build-time server artifacts are tooling, not a production backend. Only the `browser` distribution is uploaded to a static host.

## Important files

| Path relative to `C:\Documents\vinay-portfolio`         | Purpose                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `frontend\src\app\content\portfolio.ts`                 | Typed, resume-backed profile, jobs, projects, skills, education, and contact data                       |
| `frontend\src\app\content\site-settings.json`           | Public-content approval, real domain, indexing, optional approved PDF                                   |
| `frontend\src\app`                                      | `layout`, `pages`, `sections`, and `shared` organize the shell, routes, homepage, and reusable behavior |
| `frontend\src\styles.scss`                              | Design tokens, typography, shared controls, focus, responsive foundations                               |
| `frontend\public`                                       | Original favicon/social artwork and the explicitly approved `resume\Vinay_Kumar_Resume.pdf`             |
| `frontend\static-tools.mjs`                             | Publication checks, output finalization, loopback preview, social PNG renderer                          |
| `frontend\e2e`, `frontend\src\app\*.spec.ts`            | Browser journeys and colocated Angular tests                                                            |
| `frontend\static-tools.test.mjs`                        | Configuration, PDF, CSP, and static-serving behavior tests                                              |
| `frontend\dist\vinay-portfolio\browser`                 | The only deployable directory                                                                           |
| `docs\architecture.md`, `docs\design-decisions.md`      | Discovery, architecture rationale, reference research, design selection                                 |
| `docs\content-verification.md`                          | Resume-page provenance, omissions, owner confirmation checklist                                         |
| `docs\deployment.md`                                    | Exact publication, hosting, domain, rollback, and smoke-check steps                                     |
| `docs\security-and-licenses.md`, `docs\verification.md` | Security boundaries, notices, maintenance, and actual results                                           |

The lockfile pins the dependency graph. Build output, dependencies, test reports, and local/private files are ignored by source control. A narrow Git ignore exception permits only the approved resume PDF; Git attributes preserve LF text files and keep PNG/PDF assets binary.

Source repository: [vinakumar/vinay-portfolio](https://github.com/vinakumar/vinay-portfolio). The source and approved PDF are public. Vercel website: https://vinay-portfolio-brown.vercel.app/ (deployment verification is recorded separately).

## Configuration and content editing

**No environment variables or external service credentials are required for normal use.** The optional `PORT` variable changes the static preview/browser-test port (default 4173); the development server accepts `npm start -- --port 4201`. Use `Remove-Item Env:\PORT` to clear a terminal-local override when finished.

Current public settings in `frontend\src\app\content\site-settings.json`:

```json
{
  "productionUrl": null,
  "publicContentApproved": false,
  "indexingEnabled": false,
  "resume": {
    "assetPath": "resume/Vinay_Kumar_Resume.pdf",
    "downloadName": "Vinay_Kumar_Resume.pdf",
    "publicUseApproved": true
  }
}
```

These settings are public build inputs, not a place for secrets. Review source-backed copy in `portfolio.ts`, update its provenance in `docs\content-verification.md`, and rerun the checks after edits. Regenerate the PNG with `npm run social:render` when changing `public\social-preview.svg`.

The owner explicitly approved publishing the original PDF on 31 October 2026. Its unchanged copy is `frontend\public\resume\Vinay_Kumar_Resume.pdf`, served at `/resume/Vinay_Kumar_Resume.pdf`. The phone number and other original PDF content are therefore public, even before website deployment; the webpage copy still omits those additional details. No employer-project repository, metric, portrait, or credential verification link has been invented. The LinkedIn URL is exact from the PDF, but its automated fetch returned HTTP 999; the owner must confirm public availability. "Present" is taken from the supplied resume and needs a current-role check before website deployment.

`npm run release:check` **intentionally refuses the current settings** because website-content approval and a real production origin are still unset. The PDF has its own explicit approval and is already enabled. To replace or withdraw it, follow the deployment guide; merely hiding a link does not remove a public asset or its Git history.

Noindex, robots rules, and approval flags are **not access control**. Never upload unapproved/private material to a public preview.

## Deployment and remaining owner actions

The owner's selected host is **Vercel**. Root and frontend `vercel.json` configurations build the correct Angular workspace and generate static Build Output API v3 assets, routes, and actual security headers. Follow the Vercel section in `docs\deployment.md`; the original Cloudflare Direct Upload instructions remain an alternative. No application backend or paid integration is needed.

Before website deployment, complete the content/LinkedIn/current-role review, choose the real hosting origin, set the explicit public-content approval, and decide whether to enable search indexing. The approved resume is already included. Then follow `docs\deployment.md`, run the release preflight and full verification, and upload only:

```text
C:\Documents\vinay-portfolio\frontend\dist\vinay-portfolio\browser
```

The approved resume, security headers, 404, font licenses, and `3rdpartylicenses.txt` must travel with that directory. Do not upload the project root, unrelated/private documents, `node_modules`, Angular's `server` output, or a partial build.

The remaining limitations are external/manual: no public-host verification, no real email sent, no independently verified LinkedIn/credentials, and no Safari, Firefox, physical-device, or screen-reader certification. Automated accessibility checks are valuable evidence, not complete WCAG certification.
