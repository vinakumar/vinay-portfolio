# Deployment guide

## Vercel deployment and 404 repair

The owner created a Vercel project at https://vinay-portfolio-brown.vercel.app/. On 1 November 2026 its homepage returned Vercel's `404 NOT_FOUND`, despite a successful GitHub deployment status. The account-protected build logs were not available for inspection, so the exact dashboard settings could not be confirmed. The Angular workspace is under `frontend`, not the repository root.

Both the repository root and `frontend` now contain a `vercel.json`. They explicitly select the static "Other" preset, install the frontend lockfile, run the finalized Angular build, and package Vercel Build Output API v3. This supports either of those two project-root selections without a root npm package or an application server.

In **Vercel > vinay-portfolio > Settings > Build and Deployment**, use:

| Setting          | Repository root (recommended)                                              | If Root Directory is `frontend`                 |
| ---------------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| Root Directory   | Leave empty / repository root                                              | `frontend`                                      |
| Framework Preset | Other                                                                      | Other                                           |
| Install Command  | `npm ci --prefix frontend`                                                 | `npm ci`                                        |
| Build Command    | `npm --prefix frontend run build && node frontend/static-tools.mjs vercel` | `npm run build && node static-tools.mjs vercel` |
| Output Directory | `.vercel/output`                                                           | `.vercel/output`                                |
| Node.js Version  | `24.x`                                                                     | `24.x`                                          |

The versioned configurations override build/install/output/preset defaults. Root Directory and Node.js Version are dashboard settings; do not select `src`, `public`, or a `dist` folder as the project root. Redeploy the **latest commit on `main`**, not an older deployment. If automatic Git deployment is disabled, select the latest deployment and **Redeploy** after the fix is pushed.

The packaging command emits `.vercel/output/config.json` and `.vercel/output/static` relative to the selected project root. It copies only finalized browser assets, translates the actual generated CSP/security headers, explicitly maps prerendered page URLs, checks static assets before the final HTTP 404 rule, and revalidates the non-fingerprinted PDF. Cloudflare's `_headers` file is not published as a file on Vercel. No blanket homepage rewrite is used, so missing pages and assets remain genuine 404s.

**Verified result:** after pushing fix commit `b8296eb`, Vercel's Git integration deployed it automatically and the public homepage returned HTTP 200. Live desktop/mobile checks confirmed all four project URLs, client navigation, both original-PDF downloads, required assets, security headers, and the custom HTTP 404. No dashboard modification or manual redeployment was needed. The configuration table above remains guidance for future changes.

Local reproduction from the repository root, using already installed dependencies:

```powershell
Set-Location 'C:\Documents\vinay-portfolio'
npm --prefix frontend run build
node frontend\static-tools.mjs vercel
```

After deployment, confirm `/`, all four `/work/...` deep links, `/resume/Vinay_Kumar_Resume.pdf`, vendor/font assets, and a deliberately missing URL. The PDF must return `application/pdf` and match the approved source. Check actual security headers and browser hydration, not merely Vercel's "Ready" status.

Website indexing remains disabled; this routing repair does not enable indexing or silently approve other content. Configure the real production origin and review the content before enabling canonical/indexing metadata. No Vercel token is included in the repository.

Official references: https://vercel.com/docs/project-configuration/vercel-json and https://vercel.com/docs/build-output-api/configuration.

## Alternative: Cloudflare Pages

The portfolio is built and verified locally. Its public source repository is https://github.com/vinakumar/vinay-portfolio. No Cloudflare account, Pages project, or Cloudflare deployment has been created. The following is the original alternative-host guide, not a requirement to migrate away from Vercel.

Use **Cloudflare Pages static hosting**, with a prebuilt Direct Upload. This application needs neither Pages Functions nor Workers, a .NET runtime, a production Node server, a database, or an email provider. The documented Free-plan limits include 500 builds/month and 20,000 files; direct dashboard uploads are limited to 1,000 files, and each file must be at most 25 MiB. The verified local artifact contains 23 small files, including the approved PDF, well within those limits. Check the current plan/terms before creating resources.

Direct Upload projects cannot later switch to Git integration; a new project is required for that change. Choose Git integration up front only if automatic deployment is actually desired. Publishing the source repository does not automatically configure a hosting integration.

## 1. Approve the website content before deployment

Review `content-verification.md`, especially the public email, city, employer contributions, current role, and source-provided LinkedIn URL. Its automated verification was blocked with HTTP 999. Do not add client details, performance figures, or public project links without evidence and permission.

The original resume has been explicitly approved and is included as a deployment asset. Its unchanged contents, including the phone number, are public in the source repository. This separate PDF approval does not configure or authorize a website deployment.

The default build is unindexed, but **noindex is not privacy protection**. A public preview is still public. Approval flags are local preflight checks, not authentication, a hosting restriction, or a guarantee of permission.

## 2. Create an empty Pages project and obtain the real origin

After the owner authorizes account/resource setup, run from PowerShell:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npx wrangler login
npx wrangler pages project create
npx wrangler pages project list
```

The official CLI prompts for an available project name and production branch. Choose **main** as the production branch for the commands below. The name may receive a suffix if it is already taken; read the actual assigned Pages domain from the project details/list rather than guessing it. This creates an empty project, not an upload of the portfolio.

Wrangler caches the selected project and branch locally. If prompted later, select the same project. Never put a Cloudflare token in frontend code or public settings; interactive login keeps deployment authorization outside the application.

If using an existing custom domain, add it through **Workers & Pages > your Pages project > Custom domains > Set up a domain**, and follow the provider's DNS/verification instructions. A custom apex domain requires a Cloudflare zone; a subdomain can use a CNAME at another DNS provider. Associate it with Pages before adding the CNAME, or the host may return 522. No domain purchase is required to use the assigned Pages address.

## 3. Configure public settings

Edit:

```text
C:\Documents\vinay-portfolio\frontend\src\app\content\site-settings.json
```

| Setting                 | Required action                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `productionUrl`         | Set the exact, owned/assigned HTTPS origin. No path, credentials, query, or fragment. Do not use a fictitious example domain.                                        |
| `publicContentApproved` | Set to `true` only after the owner approves the actual public content.                                                                                               |
| `indexingEnabled`       | Set to `true` only when search indexing is wanted; it requires content approval and a production URL. Keep `false` for a deliberately unindexed public review build. |
| `resume`                | Already configured for the explicitly approved original PDF. Follow the replacement/withdrawal instructions below before changing it.                                |

There are no API URLs, SMTP secrets, database strings, or application runtime environment variables to configure. These JSON values are bundled publicly.

Canonical URLs and absolute social-image URLs use the configured origin. An approved indexing-enabled build emits `sitemap.xml` for the homepage and four work pages, excludes the not-found page, and points `robots.txt` at that sitemap. Otherwise it emits no sitemap and remains noindex/disallowed.

If you choose a custom domain later, update the origin, rebuild, and redeploy; otherwise metadata still identifies the former origin.

### Approved PDF download

On 31 October 2026 the owner explicitly requested publication of the supplied original PDF. Its byte-identical copy is `frontend\public\resume\Vinay_Kumar_Resume.pdf`; the source document outside the project remains unchanged. The PDF includes the original phone number and other original content, without redaction or regeneration.

The current `resume` object is:

```json
{
  "assetPath": "resume/Vinay_Kumar_Resume.pdf",
  "downloadName": "Vinay_Kumar_Resume.pdf",
  "publicUseApproved": true
}
```

`assetPath` is a web URL path, not a filesystem path. The file is served from `/resume/Vinay_Kumar_Resume.pdf` on the same origin as the website. Native download links in the hero and About sections work without JavaScript and suggest the configured filename.

For a replacement, obtain approval for the exact new PDF, copy it into `frontend\public\resume`, and keep the filename/settings/narrow `.gitignore` exception consistent. Filenames allow only letters, digits, underscores, and hyphens followed by lowercase `.pdf`. Remove the superseded public PDF; the build rejects missing, unapproved, incorrectly named, and non-PDF-signature assets, along with any other PDF in `public`. Rebuild and verify the actual downloaded bytes and content after every replacement.

To withdraw the download from a future build, remove the public asset and set `resume` to `null`, then rebuild; the component restores the email-request fallback. Merely changing the UI or approval flag does not make an existing file private. Published Git history and other people's copies are not erased by this change.

## 4. Run the release checks and inspect the artifact

With dependencies and the matching Chromium installed:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npm run release:check
npm run verify
npm audit --audit-level=low
```

Stop if a command fails. With the current unapproved/null-domain defaults, `release:check` is expected to refuse publication. The preflight validates source settings and PDF assets; it does not make an older build fresh or deploy anything. Always rebuild after configuration/content changes.

Upload **only**:

```text
C:\Documents\vinay-portfolio\frontend\dist\vinay-portfolio\browser
```

It must contain `index.html`, four `work` route directories, `not-found\index.html`, `404.html`, `_headers`, `robots.txt`, hashed JS/CSS/fonts, original favicon/social artwork, `3rdpartylicenses.txt`, and both font-license directories. The current configuration also includes the approved `resume\Vinay_Kumar_Resume.pdf`. An indexing-enabled release also contains the sitemap.

Do not upload `dist\vinay-portfolio\server`, the entire Angular workspace, `node_modules`, private source files, or unrelated/unapproved documents. There is no production server startup command.

## 5. Upload the finalized directory

For the empty project whose production branch was set to `main`:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npx wrangler pages deploy '.\dist\vinay-portfolio\browser' --branch main
```

This command **publishes the content**. Run it only after approval and successful release checks. Read and retain the actual deployment URL from Wrangler; no URL has been created by this implementation.

Alternatively, use the existing project's **Create a new deployment** dashboard action, choose production, and drag in the finalized `browser` directory. The dashboard accepts a directory or ZIP; Wrangler accepts a directory, not ZIP. Keep `index.html` at the uploaded artifact root, not inside an extra `browser` parent directory.

The project has no Functions folder or `_worker.js`; do not add one as a deployment workaround. Cloudflare's `_headers` rules apply to static assets, not Functions responses.

### Serving, caching, and security

- Keep `404.html`. Pages uses it for genuine unknown-route responses rather than silently serving the homepage with HTTP 200.
- Keep `_headers`. Pages interprets it instead of exposing it as a downloadable file. It contains the generated CSP, security/privacy headers, HTML revalidation, and immutable rules for fingerprinted assets.
- Upload a whole, freshly finalized build atomically. HTML, script hashes, and hashed asset names must belong to the same build.
- Do not enable script injectors, Rocket Loader, or HTML rewriting/minification without reviewing their CSP/hydration effects. In particular, changes to inline script text invalidate the generated hashes. Do not solve that by allowing unsafe inline/eval scripts.
- Do not casually enable hosting analytics or third-party widgets. They add requests and privacy obligations, and are intentionally excluded by this site's CSP.
- Require HTTPS. Pages handles static compression and ETags; verify actual responses at the selected host. HSTS is emitted, without a blanket subdomain-preload commitment.
- Review any host-level cache rules. Overlapping Pages header rules can combine values, so avoid contradictory broad `Cache-Control` overrides.

## 6. Verify the actual public deployment

Copy the actual HTTPS origin into the source configuration first. The following reads that real value rather than inventing a URL:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
$settings = Get-Content -Raw '.\src\app\content\site-settings.json' | ConvertFrom-Json
$origin = $settings.productionUrl
if (-not $origin) { throw 'Configure the real production origin first.' }
curl.exe -I "$origin/"
curl.exe -I "$origin/work/ticketing-and-identity"
curl.exe -I "$origin/this-page-does-not-exist"
curl.exe -I "$origin/3rdpartylicenses.txt"
curl.exe -I "$origin/resume/Vinay_Kumar_Resume.pdf"
curl.exe "$origin/robots.txt"
```

Confirm HTTPS and the security headers on real responses, successful homepage/deep links, HTTP 404 for the missing path, and available license assets. Allow for the host's normal canonical-path redirects. If indexing is enabled, inspect `sitemap.xml`, canonical URLs, and the absolute social image. Verify unknown pages remain noindex.

In real desktop/mobile browsers, check navigation, layout, fonts, keyboard focus, email targets, clipboard behavior, LinkedIn, social preview, console/network errors, and the actual PDF download from both entry points. Confirm HTTP 200, `application/pdf`, the suggested filename, and unchanged contents. A mailto link only opens an email client; it does not prove delivery. Recheck behavior under the host's CSP, not only the development server.

These Cloudflare-specific checks have not been run against a Cloudflare deployment. The owner's Vercel HTTPS/page/asset/header/download checks passed as recorded above; custom-domain/DNS administration, search indexing, and real email delivery remain outside that verification.

## Rollback and updates

Keep the complete last-known-good artifact and its matching source/settings before releasing an update. In the Pages project's **Deployments > All deployments**, use the desired successful production deployment's three-dot menu and **Rollback to this deployment**. Preview deployments are not valid rollback targets.

Repeat the real-host smoke checks after rollback. Restore the corresponding source/configuration for future builds as well; a hosting rollback does not alter local files. Do not combine new HTML with old hashed assets or headers.

For future changes: update evidence-backed content, run `release:check` and `verify`, audit dependencies, inspect the output, deploy the complete directory, and verify the host. See `security-and-licenses.md` for dependency and privacy maintenance.

## Troubleshooting

| Symptom                         | Action                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Publication preflight refuses   | Review the approval/domain message; do not bypass it or upload private content.                                             |
| Resume build check fails        | Confirm explicit file approval, safe names, the exact existing PDF, and no stray PDFs in `public`.                          |
| Browser test executable missing | Run `npx playwright install chromium`; follow the root README's trusted-CA note if needed.                                  |
| Port 4173 already in use        | Choose an unused `PORT` for the preview/browser suite, or stop only your own preview; do not terminate unrelated processes. |
| Deep links return the homepage  | Verify the complete route directories and real `404.html`; remove any unintended SPA catch-all host override.               |
| CSP errors after rebuilding     | Restart a local preview, or deploy the complete fresh artifact. Check for host-side HTML/script rewriting.                  |
| Fonts/licenses missing          | Use `npm run build` and upload the complete browser directory, including `media` and `licenses`.                            |
| Wrong canonical/social URL      | Correct `productionUrl`, rebuild, and redeploy. Do not edit generated HTML by hand.                                         |
| Custom domain returns 522       | Associate the domain with Pages before configuring its CNAME, then complete provider verification.                          |

## Official sources checked

Reviewed 31 October 2026:

- https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/rollbacks/
