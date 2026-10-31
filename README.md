# Vinay Kumar - Engineering fieldnotes

A complete, original Angular portfolio at `C:\Documents\vinay-portfolio`, built from the owner's supplied resume. **Website implemented and verified locally; not deployed.**

The warm paper, dark green, sage, and citron design uses editorial typography and original geometric artwork. It puts professional contributions ahead of decorative effects, with a readable single-column mobile layout.

## What is included

- A homepage with an introduction, four selected work summaries, four-role experience timeline, expertise, AI-assisted engineering note, about, education, qualifications, contact, and footer.
- Four individually addressable professional project pages, next-project navigation, browser history support, and a useful not-found page with real HTTP 404 responses.
- Responsive navigation, active-section tracking, a keyboard skip link, routed heading focus, reduced-motion support, and an accessible reload/dismiss notice when a project bundle fails to load.
- Direct email, the source-provided LinkedIn link, real clipboard feedback, and an honest **Request my resume** action. There is no pretend email submission or broken download.
- Prerendered HTML, self-hosted fonts, an original favicon and social image, conditional canonical/social URLs and sitemap, production security headers, and publication checks.

The project summaries describe resume-listed work at Giesecke+Devrient, Ticketmaster, Smart Energy Water, and Capgemini. They are not invented side projects or claims of ownership of those companies' systems.

## Start locally

Use **Node.js 24.19.0 and npm 12.0.2**, the verified versions. The project accepts compatible Node 24 releases from 24.15.0; `.node-version` records the tested version. A .NET SDK, Python, database, email account integration, and global Angular CLI are not required.

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

`verify` runs lint, formatting, strict type checks, Angular tests, Node tooling tests, the production build, and browser tests. The browser suite starts and stops its own preview on port 4173; stop any preview you started on that port first.

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

**47 tests passed:** 18 Angular tests, 7 Node tooling tests, and 22 production Chromium tests. Lint, formatting, strict type checks, production build, and both dependency audits passed; both audits reported zero known vulnerabilities. Browser checks covered 320, 375, 768, 1024, and 1440 pixels, keyboard/touch navigation, accessibility, deep links, error recovery, assets, and headers. The documented development command also returned the real homepage with HTTP 200.

The production build contains six prerendered routes plus a real 404, with a 332.68 kB initial JS/CSS bundle and an Angular CLI estimated compressed transfer of 89.44 kB. This estimate is not total page weight or a field-performance score.

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
| `frontend\public`                                       | Original favicon/social artwork; no original resume                                                     |
| `frontend\static-tools.mjs`                             | Publication checks, output finalization, loopback preview, social PNG renderer                          |
| `frontend\e2e`, `frontend\src\app\*.spec.ts`            | Browser journeys and colocated Angular tests                                                            |
| `frontend\static-tools.test.mjs`                        | Configuration, PDF, CSP, and static-serving behavior tests                                              |
| `frontend\dist\vinay-portfolio\browser`                 | The only deployable directory                                                                           |
| `docs\architecture.md`, `docs\design-decisions.md`      | Discovery, architecture rationale, reference research, design selection                                 |
| `docs\content-verification.md`                          | Resume-page provenance, omissions, owner confirmation checklist                                         |
| `docs\deployment.md`                                    | Exact publication, hosting, domain, rollback, and smoke-check steps                                     |
| `docs\security-and-licenses.md`, `docs\verification.md` | Security boundaries, notices, maintenance, and actual results                                           |

The lockfile pins the dependency graph. Build output, dependencies, test reports, and local/private files are ignored by source control. Git attributes preserve LF text files across platforms and keep the social PNG binary.

Source repository: [vinakumar/vinay-portfolio](https://github.com/vinakumar/vinay-portfolio). Public source hosting does not deploy the website or enable a resume download.

## Configuration and content editing

**No environment variables or external service credentials are required for normal use.** The optional `PORT` variable changes the static preview port; the development server accepts `npm start -- --port 4201`. Browser tests use 4173 by design.

Current public settings in `frontend\src\app\content\site-settings.json`:

```json
{
  "productionUrl": null,
  "publicContentApproved": false,
  "indexingEnabled": false,
  "resume": null
}
```

These settings are public build inputs, not a place for secrets. Review source-backed copy in `portfolio.ts`, update its provenance in `docs\content-verification.md`, and rerun the checks after edits. Regenerate the PNG with `npm run social:render` when changing `public\social-preview.svg`.

The original PDF and phone number are intentionally absent. No GitHub handle, project repository, metric, portrait, or credential verification link has been invented. The LinkedIn URL is exact from the PDF, but its automated fetch returned HTTP 999; the owner must confirm public availability. "Present" is taken from the supplied resume and needs a current-role check before publication.

`npm run release:check` **intentionally refuses the current settings**. After reviewing public contact/employer information and confirming the real HTTPS origin, the owner can explicitly approve the content. An optional PDF requires separate, specific approval and an actual matching asset; see the deployment guide. It is not necessary to enable a download to publish a complete portfolio.

Noindex, robots rules, and approval flags are **not access control**. Never upload unapproved/private material to a public preview.

## Deployment and remaining owner actions

The recommended deployment is **static Cloudflare Pages**, within its documented Free-plan limits, using a prebuilt Direct Upload. No paid service, hosting resource, account, or deployment was created.

Before any public upload, complete the content/LinkedIn/current-role review, choose the real hosting origin, set the explicit public-content approval, decide whether to enable search indexing, and optionally approve a specific PDF. Then follow `docs\deployment.md`, run the release preflight and full verification, and upload only:

```text
C:\Documents\vinay-portfolio\frontend\dist\vinay-portfolio\browser
```

The security headers, 404, font licenses, and `3rdpartylicenses.txt` must travel with that directory. Do not upload the project root, source resume, `node_modules`, Angular's `server` output, or a partial build.

The remaining limitations are external/manual: no public-host verification, no real email sent, no independently verified LinkedIn/credentials, and no Safari, Firefox, physical-device, or screen-reader certification. Automated accessibility checks are valuable evidence, not complete WCAG certification.
