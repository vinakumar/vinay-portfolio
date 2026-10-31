# Deployment guide

## Status and chosen host

The portfolio is built and verified locally. Its public source repository is https://github.com/vinakumar/vinay-portfolio. **No Cloudflare account, Pages project, domain, or website deployment has been created.** Hosting commands below are instructions for the owner after approving public website use; they were not executed as part of the implementation.

Use **Cloudflare Pages static hosting**, with a prebuilt Direct Upload. This application needs neither Pages Functions nor Workers, a .NET runtime, a production Node server, a database, or an email provider. The documented Free-plan limits include 500 builds/month and 20,000 files; direct dashboard uploads are limited to 1,000 files, and each file must be at most 25 MiB. The verified local artifact contains 22 small files, well within those limits. Check the current plan/terms before creating resources.

Direct Upload projects cannot later switch to Git integration; a new project is required for that change. Choose Git integration up front only if automatic deployment is actually desired. Publishing the source repository does not automatically configure a hosting integration.

## 1. Approve the content before any upload

Review `content-verification.md`, especially the public email, city, employer contributions, current role, and source-provided LinkedIn URL. Its automated verification was blocked with HTTP 999. Do not add client details, performance figures, or public project links without evidence and permission.

The original resume is not a deployment asset. Keeping `resume` null is a complete, supported configuration with a real email-request action.

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
| `resume`                | Keep `null`, or follow the separate PDF approval instructions below.                                                                                                 |

There are no API URLs, SMTP secrets, database strings, or application runtime environment variables to configure. These JSON values are bundled publicly.

Canonical URLs and absolute social-image URLs use the configured origin. An approved indexing-enabled build emits `sitemap.xml` for the homepage and four work pages, excludes the not-found page, and points `robots.txt` at that sitemap. Otherwise it emits no sitemap and remains noindex/disallowed.

If you choose a custom domain later, update the origin, rebuild, and redeploy; otherwise metadata still identifies the former origin.

### Optional approved PDF

Choose the exact PDF the owner authorizes for public distribution. Do not silently redact, regenerate, or substitute the supplied original. It contains a phone number and remains outside this project.

Copy the approved file into `frontend\public\resume` using a filename containing only letters, digits, underscores, and hyphens, with a lowercase `.pdf` extension. For a file actually named `Approved_Name.pdf`, the corresponding setting would be:

```json
{
  "assetPath": "resume/Approved_Name.pdf",
  "downloadName": "Approved_Name.pdf",
  "publicUseApproved": true
}
```

This object replaces the `resume: null` value; it is not the entire settings file. `assetPath` is a web URL path, while the physical file is `frontend\public\resume\Approved_Name.pdf`. The example name is not a supplied or generated resume.

The build rejects missing, unapproved, incorrectly named, and non-PDF-signature assets, along with any other PDF in `public`. The UI separately checks approval before offering a download. Rebuild and run the tests after enabling it, then manually open the actual download and verify the content. The implementation did not enable or publish any PDF.

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

It must contain `index.html`, four `work` route directories, `not-found\index.html`, `404.html`, `_headers`, `robots.txt`, hashed JS/CSS/fonts, original favicon/social artwork, `3rdpartylicenses.txt`, and both font-license directories. An indexing-enabled release also contains the sitemap. A PDF appears only when separately approved.

Do not upload `dist\vinay-portfolio\server`, the entire Angular workspace, `node_modules`, private source files, or the original resume. There is no production server startup command.

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
curl.exe "$origin/robots.txt"
```

Confirm HTTPS and the security headers on real responses, successful homepage/deep links, HTTP 404 for the missing path, and available license assets. Allow for the host's normal canonical-path redirects. If indexing is enabled, inspect `sitemap.xml`, canonical URLs, and the absolute social image. Verify unknown pages remain noindex.

In real desktop/mobile browsers, check navigation, layout, fonts, keyboard focus, email targets, clipboard behavior, LinkedIn, social preview, console/network errors, and the optional actual PDF. A mailto link only opens an email client; it does not prove delivery. Recheck behavior under the host's CSP, not only the development server.

No deployed-host, DNS, TLS-certificate, search-indexing, or real email-delivery verification has yet occurred.

## Rollback and updates

Keep the complete last-known-good artifact and its matching source/settings before releasing an update. In the Pages project's **Deployments > All deployments**, use the desired successful production deployment's three-dot menu and **Rollback to this deployment**. Preview deployments are not valid rollback targets.

Repeat the real-host smoke checks after rollback. Restore the corresponding source/configuration for future builds as well; a hosting rollback does not alter local files. Do not combine new HTML with old hashed assets or headers.

For future changes: update evidence-backed content, run `release:check` and `verify`, audit dependencies, inspect the output, deploy the complete directory, and verify the host. See `security-and-licenses.md` for dependency and privacy maintenance.

## Troubleshooting

| Symptom                         | Action                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Publication preflight refuses   | Review the approval/domain message; do not bypass it or upload private content.                               |
| Resume build check fails        | Confirm explicit file approval, safe names, the exact existing PDF, and no stray PDFs in `public`.            |
| Browser test executable missing | Run `npx playwright install chromium`; follow the root README's trusted-CA note if needed.                    |
| Port 4173 already in use        | Stop the preview you started before the browser suite; do not terminate unrelated processes.                  |
| Deep links return the homepage  | Verify the complete route directories and real `404.html`; remove any unintended SPA catch-all host override. |
| CSP errors after rebuilding     | Restart a local preview, or deploy the complete fresh artifact. Check for host-side HTML/script rewriting.    |
| Fonts/licenses missing          | Use `npm run build` and upload the complete browser directory, including `media` and `licenses`.              |
| Wrong canonical/social URL      | Correct `productionUrl`, rebuild, and redeploy. Do not edit generated HTML by hand.                           |
| Custom domain returns 522       | Associate the domain with Pages before configuring its CNAME, then complete provider verification.            |

## Official sources checked

Reviewed 31 October 2026:

- https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/rollbacks/
