# Verification record

## Vercel repair - 1 November 2026

The reported public homepage was reproduced as a Vercel platform `404 NOT_FOUND`, despite GitHub reporting a successful deployment. The private dashboard logs/settings were not accessible. Root and frontend `vercel.json` files now explicitly build the nested workspace and package the finalized browser output using Build Output API v3.

The existing complete `npm run verify` gate passed after this change: **49 tests (18 Angular, 8 Node tooling, 23 production Chromium)**, plus lint, formatting, strict type checks, and production build. The new tooling regression checks actual copied homepage/project/PDF files, matching generated CSP/noindex headers, explicit deep-link mapping, filesystem-first genuine 404 handling, exclusion of Cloudflare `_headers`, removal of obsolete output assets, and rejection of an unfinalized build.

The Vercel packaging command was also run locally from the repository root. Real account-side deployment and HTTP/browser verification are separate from these local checks; see `deployment.md` for exact dashboard settings. No Vercel credentials, generated output, hosting functions, indexing enablement, or dependency changes are included.

## Final result - 31 October 2026

The implemented portfolio, including the approved original-PDF downloads, passed the complete `npm run verify` gate against its finalized production build. **48 automated tests passed: 18 Angular, 7 Node tooling, and 23 Chromium browser tests.** There are no remaining failing application tests or known build/lint/type failures in this handover.

| Check actually executed                       | Result                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`                                | Passed Angular/TypeScript/template linting.                                                                                                            |
| `npm run format:check`                        | Passed configured frontend formatting.                                                                                                                 |
| `npm run typecheck`                           | Passed strict application, Angular-test, and Playwright TypeScript configurations.                                                                     |
| `npm test`                                    | 7 files, 18 tests passed with Angular TestBed/Vitest.                                                                                                  |
| `npm run test:tooling`                        | 7 Node tests passed.                                                                                                                                   |
| `npm run build`                               | Passed; six routes prerendered, seven finalized HTML documents including the real 404.                                                                 |
| `npm run test:e2e`                            | 23 tests passed, two Chromium workers, zero retries or skipped tests. Final run: 25.1 seconds.                                                         |
| `npm audit --audit-level=low`                 | Zero known vulnerabilities in the full dependency graph.                                                                                               |
| `npm audit --omit=dev --audit-level=low`      | Zero known runtime-dependency vulnerabilities.                                                                                                         |
| `npm start` and an HTTP readiness request     | Actual portfolio homepage returned HTTP 200 from `http://127.0.0.1:4200/`. The temporary development server was stopped.                               |
| `npm run release:check` with current defaults | Correctly refused unapproved content and the missing production origin. This is expected safety behavior, not an unresolved test failure.              |
| Final browser artifact inventory              | 23 files, 743,784 bytes in aggregate; seven HTML documents, one approved 70,810-byte PDF, zero source maps, no starter favicon or unused CSR fallback. |
| Original/public/build PDF integrity           | All three files have SHA-256 `EA7C02F32250BB4B531F655538F4EBD46550345D44B9EF37CDD9E0935D688E8B`; the supplied original is unchanged.                   |

The commands were run in `C:\Documents\vinay-portfolio\frontend`. Node.js 24.19.0 and npm 12.0.2 were used. Angular runtime/compiler is 22.2.4, CLI/build/SSR is 22.2.5, and TypeScript is 6.0.3.

An existing process occupied port 4173 during the first browser-stage attempt. The test runner now accepts the same optional `PORT` as the static preview, with all journeys using that configured origin. The successful full gate used an isolated loopback port (64744), left the existing process untouched, and stopped its own preview afterward. The dependency graph was unchanged; the audit results above are from the earlier same-day checks.

## Behavior covered

### Angular tests

The focused component/service tests cover the real home/project shell, initial and subsequent navigation focus, mobile navigation/Escape/focus return, optional verified project links, approval-controlled resume actions, metadata behavior, and clipboard success, denial, unavailability, and in-progress state.

A route-failure test verifies that existing content remains available, the recovery link identifies the failed destination, focus reaches that link, and dismissing the notice restores focus to its originating control. The original failed navigation remains a rejected navigation rather than being concealed as a successful result.

### Publication and static-serving tests

The Node tests cover explicit publication/indexing approval, HTTPS-origin validation, safe resume paths, missing/unapproved/non-PDF assets, actual inline-script CSP hashing, traversal/Windows-path rejection, real route/404/HEAD/POST behavior, and immutable cache treatment of URL-safe hashed filenames.

Actual generated vendor/font notices and security headers are additionally retrieved in browser tests, rather than assumed correct because a configuration file exists.

### Production browser journeys

The suite uses Playwright 1.64.1 with its own Chromium, Chrome for Testing 156.0.8078.4, revision 1248. It runs against the production static preview, not an in-memory mock or only the Angular development server.

- Homepage rendering, all local asset requests, browser console/page errors, and no external rendering requests.
- Layout and navigation at **320, 375, 768, 1024, and 1440 pixels**, including no horizontal overflow.
- axe checks using WCAG 2 A/AA, 2.1 AA, and 2.2 AA tags, with no reported violations in the tested states.
- Keyboard skip link, all primary section anchors, active navigation state, focus visibility, sticky-header clearance, and back-to-top behavior.
- Mobile menu open/close, changing accessible names, Escape, focus return, and a separate emulated-touch journey.
- All four project URLs, direct loading, reloads, metadata, 320px detail layout, project cards, next-project links, history, and return links.
- A genuinely aborted lazy project-script request followed by an accessible full-document reload after network recovery.
- The source-backed email and LinkedIn link targets, actual clipboard write/read, and a denied clipboard operation without false success.
- Real PDF downloads from both the hero and About at 320px and 1440px, correct HTTP status/MIME type/filename, and downloaded bytes identical to the approved public asset. The email-request action is absent in this approved configuration.
- Keyboard-activated PDF download with JavaScript disabled and a mobile touch download, alongside the existing native-navigation and mobile-menu journeys.
- Reduced motion and usable prerendered content/native links with JavaScript disabled.
- Unknown routes, unknown project slugs, and missing assets returning usable HTTP 404s without hydration exceptions.
- Served CSP/security/robots rules, social image, favicon, self-hosted fonts, vendor/font notices, and sensible rendering metrics.

## Visual review and performance

Full-page screenshots were generated at all five requested widths. The updated 375px and 1440px hero images were inspected for download-link placement, wrapping, spacing, and preservation of the work/experience actions. The earlier full-portfolio review also inspected the desktop project detail page and actual social PNG. The original paper/green visual system is retained.

The final initial JS/CSS bundle is **332.83 kB raw**, with an Angular CLI **89.52 kB estimated compressed transfer**. The project-detail lazy chunk is 8.96 kB raw. The initial warning/error budgets are 350/450 kB; no budget warning or error was emitted. These figures exclude HTML, fonts, the PDF, and other assets and are not a total page-weight measurement.

The final local rendering sample recorded:

| Local measurement        | Observed value       |
| ------------------------ | -------------------- |
| Cumulative Layout Shift  | 0.005406837203414352 |
| Largest Contentful Paint | 144 ms               |
| DM Sans loaded           | true                 |
| IBM Plex Mono loaded     | true                 |

The test enforces CLS below 0.1 and verifies font loading. LCP is recorded, not judged against a hardware-speed assertion. This is one unthrottled loopback Chromium sample, **not** Lighthouse, a mobile-network benchmark, or field Core Web Vitals.

## Reproducible evidence

From the frontend directory:

```powershell
npm run verify
npx playwright show-report
```

Set an unused terminal-local `PORT` first if the default 4173 is occupied; the tests do not reuse another preview. Close the report viewer with `Ctrl+C` when done. Reports and screenshots are generated output and are intentionally ignored by source control.

Useful current artifacts:

```text
C:\Documents\vinay-portfolio\frontend\playwright-report\index.html
C:\Documents\vinay-portfolio\frontend\test-results
```

Viewport folders contain `home-320.png`, `home-375.png`, `home-768.png`, `home-1024.png`, and `home-1440.png`. The 375/1440 folders also contain hero screenshots, and the project journey contains `project-desktop.png`.

The rendering sample is persisted at:

```text
C:\Documents\vinay-portfolio\frontend\test-results\portfolio-self-hosted-font-726a3-ut-substantial-layout-shift-chromium\local-render-metrics.json
```

Playwright replaces the output for later runs. Run the complete suite rather than a single selector when regenerating all screenshot evidence. Failures retain screenshots and traces; the final report records the successful suite.

## Failures found and resolved

| Finding during implementation                                       | Resolution and evidence                                                                                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initial navigation focused the hero and skipped the skip link       | Focus management now distinguishes initial hydration from later navigation; unit and keyboard browser checks pass.                                                                                     |
| Contact was visible but About remained the active navigation item   | Replaced the unsuitable observation band with cached, animation-frame-throttled geometry tracking and a page-bottom case; all primary-anchor/viewport checks pass.                                     |
| A failed lazy project bundle left no visible recovery               | First reproduced with a real aborted script request and a failing browser assertion. Added a reload/dismiss notice, focus handling, and native full-page recovery; the regression and full suite pass. |
| Managed Edge blocked browser automation                             | Used Playwright's separately installed Chromium without changing administrator policy.                                                                                                                 |
| Browser download could not validate the managed certificate chain   | Retried with terminal-local `NODE_USE_SYSTEM_CA=1`; TLS verification stayed enabled.                                                                                                                   |
| Initial font CSS import did not exist in the installed package      | Used explicit self-hosted Latin WOFF2 declarations; browser font checks pass.                                                                                                                          |
| Angular ESLint introduced vulnerable transitive minimatch           | Applied the documented 11.0.3 override; both audits and the complete quality gate pass.                                                                                                                |
| Test fixtures assumed responsive CSS in jsdom or a static menu name | Corrected the fixtures/locators while retaining the actual focus and accessible-name assertions. Real browser responsive checks also pass.                                                             |
| A performance probe used an invalid strict Window assertion         | Added an optional typed test-only Window property with an initialization guard; all strict configurations pass.                                                                                        |

Unused scaffold UI, Express/server entry, Angular Forms, starter icon, misleading generated editor tasks, and the unused CSR fallback were removed after checking their role. The finalized distribution retains required license notices.

## Explicitly unverified or intentionally absent

- No public deployment, actual host/DNS/TLS verification, search-indexing result, social-network scrape, or Cloudflare account/resource operation.
- The approved original PDF is downloadable locally and included in the public source repository; its eventual website-host response/caching behavior remains unverified until deployment.
- No real email sent, mailbox ownership established, or delivery confirmed. Contact is intentionally a mailto/clipboard flow, not an API.
- LinkedIn's exact source URL was checked against the PDF, but automated access returned HTTP 999; public availability requires the owner's browser review.
- Certifications and employment are resume-backed, not independently verified with employers or credential issuers. The current role needs owner confirmation before public use.
- No physical-device testing, Firefox, Safari/WebKit, managed Edge automation, screen-reader certification, or formal accessibility/security certification.
- No clean-room installation on a second machine. Dependencies were installed locally after manifest changes, the lockfile is included, and documented start/build/test commands were exercised here.
- No Lighthouse run, throttled-network score, field-performance data, uptime claim, or production load-test claim.
- No backend tests, API CORS tests, SMTP integration tests, or secret configuration: the chosen architecture has no such services.

These limits do not block the completed local portfolio. Content approval and real-host smoke checks are required before public use; adding optional services would be a separate implementation.
