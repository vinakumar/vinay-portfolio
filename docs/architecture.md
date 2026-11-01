# Architecture and implementation plan

## Discovery - 31 October 2026

- Destination: `C:\Documents\vinay-portfolio`. The parent contains unrelated work; this new directory isolates the portfolio.
- Source: the two-page `Vinay_Kumar_Resume.pdf` supplied by the owner. Extracted locally, including its embedded LinkedIn URL. It was initially excluded; the owner's subsequent explicit download/publication request authorized an unchanged copy in public assets.
- Verified career scope: Senior Software Engineer at Giesecke+Devrient, Senior Engineer I at Ticketmaster, Product Engineer at Smart Energy Water, and Software Engineer at Capgemini.
- Professional focus: C#/.NET, APIs, distributed systems, data access, messaging, cloud delivery, frontend applications, testing, and production diagnosis.
- Installed tools: Node.js 24.19.0, npm 12.0.2, .NET SDKs 8.0.427, 9.0.123, 10.0.303 and 10.0.403. Latest installed .NET runtime: 10.0.14. Microsoft Edge is installed, but administrator policy blocked its automation. Browser testing used Playwright's separate Chromium without changing that policy.
- Registry stable releases checked: Angular core 22.2.4, Angular CLI/build/SSR 22.2.5. Node 24.19.0 satisfies their `^24.15.0` range; Angular build requires TypeScript `>=6.0 <6.1`. The implementation uses TypeScript 6.0.3 and no prerelease framework packages.
- Release recheck on 31 October 2026: the Angular versions still match the latest stable tags. Node 26.13.0 is the latest LTS, and 24.22.2 is the latest Node 24 patch. The existing verified Node 24.19.0 runtime was retained, not represented as the latest Node release.
- Microsoft's support table identifies .NET 10 as the current stable LTS release, supported through 14 November 2028. No .NET application is needed for the selected scope.
- Reference repository inspected: `emmabostian/developer-portfolios`, README revision `fa83a75e4b1d21ef681c9ed4d3467e91f635dca5`. Three linked portfolios were fetched; observations and limitations are in `design-decisions.md`.
- At initial discovery, no production domain, GitHub profile, approved downloadable resume, email-delivery credentials, or public employer-project repositories were provided. The owner later confirmed the GitHub account and explicitly approved the supplied PDF.

## Product scope and information architecture

The homepage is a concise engineering portfolio: hero, selected professional work, experience, expertise, about/education/certifications, contact, and footer. Navigation links to real section anchors. Four individually addressable project summaries provide deeper context without disclosing internal architecture or client identities. Unknown routes have a useful not-found view.

Contact uses the professional email address present in the resume, a copy-email action with honest clipboard feedback, and the exact resume-provided LinkedIn link. A `mailto:` link opens the visitor's email application; it does not submit or claim to deliver a message.

The owner explicitly approved the original resume for public distribution on 31 October 2026. An unchanged copy is kept at `frontend\public\resume\Vinay_Kumar_Resume.pdf`; the original phone number and other PDF contents are consequently public. The shared resume component provides native, same-origin downloads in the hero and About sections, including before hydration or with JavaScript disabled. The hero keeps its existing work/experience links and gives recruiters an early download entry point; About retains the action next to professional background.

Typed settings retain explicit PDF approval. The build rejects missing, unapproved, or invalid assets; removing the approved file and setting `resume` to `null` restores the honest email-request fallback. Removing a local file does not erase public copies or Git history.

## Backend decision

**No backend, database, authentication, analytics, or third-party form service.** All portfolio content is static, professional links are ordinary links, and direct email meets the contact requirement without external accounts, credentials, storage, spam endpoints, or pretend submission success.

A real in-site email form would justify a small ASP.NET Core 10 API in a future, separately scoped change. It would need an approved delivery provider, server-side validation, request-size limits, rate limiting, spam protection, narrow CORS, privacy-aware logging, real delivery/error responses, and mocked-provider integration tests. Those unused layers do not belong in this project.

## Rendering and frontend boundaries

- Angular standalone components, strict TypeScript and template checks, SCSS, and the Angular Router.
- Build-time prerendering through Angular's supported `@angular/ssr` integration with `outputMode: static`. This serves meaningful HTML to crawlers and visitors before hydration, without a production Node server.
- Typed, local portfolio data is the single source of professional copy and project identifiers.
- Shared shell owns the header, navigation, footer, and route focus behavior. A failed lazy route exposes an accessible reload/dismiss notice while preserving the existing page and normal error reporting. The retry is a native full-page navigation so a failed module import can be fetched again in a fresh document.
- Homepage sections are grouped by responsibility rather than one component per label.
- Project details are lazy-loaded and prerendered from the same verified project data.
- Signals are used for local interaction state; no application-wide state library.
- Browser-only clipboard, animation-frame-throttled scroll tracking, and focus effects are guarded for prerendering and cleaned up. The scroll tracker caches the five section elements, includes a short-last-section/page-bottom case, and performs at most one geometry update per animation frame.
- Self-hosted, open-licensed typography; original geometric illustrations and icons. No external scripts, hotlinked imagery, or fetched profile statistics.
- Static preview tooling is a loopback-only development helper, not an application backend.

Final execution evidence is in `verification.md`; operational publication steps are in `deployment.md`. The original plan below is retained as the implementation sequence, not as unfinished feature work.

## Implementation sequence

1. Record discovery, source claims, privacy gates, design comparison, architecture, and acceptance criteria.
2. Scaffold with the verified stable Angular CLI, routing, SCSS, strict mode, Vitest, and prerendering. Build the untouched scaffold before substantive feature work.
3. Establish the visual tokens, typography, fluid layout, focus indicators, buttons, and restrained motion.
4. Implement typed content, responsive navigation, homepage sections, useful project routes, contact interactions, resume gating, and page metadata.
5. Add publication checks, real static 404 output, security headers, local preview tooling, and deployment preparation.
6. Run meaningful unit tests, lint, formatting, production build, dependency audit, and Playwright journeys. Inspect screenshots and test accessibility/overflow at 320, 375, 768, 1024, and 1440 pixels.
7. Correct failures, review content/privacy and implementation boundaries, finish run/deploy documentation, and report actual evidence and remaining owner approvals.

## Testing and acceptance

- Vitest with Angular TestBed for behavior: navigation state, route/content resolution, conditional project links, resume gating, and clipboard success/failure/unavailable cases.
- Playwright against the **production static build**, not just the development server: real navigation, deep links, browser history, contact targets, keyboard/mobile menu, route focus, reduced motion, and no broken local assets or browser errors.
- axe-core WCAG 2.2 AA checks plus keyboard/focus and responsive geometry inspection. Automated checks are not a complete accessibility certification.
- Every specified viewport must have no horizontal overflow, overlap, or clipped primary actions.
- Unknown paths/assets must return a real 404 rather than a successful HTML response.
- Only the exact owner-approved PDF may be included in public assets and downloaded. Webpage summaries continue omitting phone/client details and unsupported statistics; no fake project links, internal infrastructure URLs, or secrets are added.
- Prerendered HTML must contain real page text; production build, strict type checks, lint, formatting, and meaningful tests must pass.
- Owner can install, run, test, preview, and build using exact documented commands, with no external credentials.
- Website deployment is prepared, not executed. PDF approval is recorded separately; website-content review and a real production domain remain explicit deployment steps.

## Deployment outline

The original recommendation was static Cloudflare Pages with prebuilt Direct Upload; no Cloudflare resource or deployment was created. The owner subsequently selected Vercel. Explicit root/frontend configurations now package the same static Angular browser build into Build Output API v3 with actual CSP/security headers, prerendered URL mappings, filesystem assets, and genuine 404 fallback. Vercel deployed the fix automatically on 1 November 2026; live checks are recorded in `verification.md`. The public source repository is https://github.com/vinakumar/vinay-portfolio.

Security headers and a static 404 page travel with the build. Use HTTPS, short-lived HTML caching, immutable fingerprinted assets, and rollback to a previous verified deployment. Once a real domain is approved, generate canonical URLs, social-image URLs, and a sitemap from that domain rather than inserting a fictitious address.

## Sources

- https://angular.dev/reference/versions
- https://nodejs.org/dist/index.json
- https://angular.dev/cli/new
- https://angular.dev/guide/testing
- https://angular.dev/guide/ssr
- npm registry metadata for `@angular/core`, `@angular/cli`, and `@angular/build` (checked 31 October 2026)
- https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core
- https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/
- https://developers.cloudflare.com/pages/platform/limits/
