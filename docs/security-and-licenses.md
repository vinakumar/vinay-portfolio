# Security, privacy, and third-party notices

## Implemented boundary

This is a static portfolio application. The website has not been deployed, but the source repository and explicitly approved resume PDF are public. There is no authentication, message-submission API, database, SMTP integration, analytics, tracking cookie, or application-owned message store.

The only outbound contact actions are explicit user-initiated email/LinkedIn links. Normal page rendering uses local assets; the production browser tests found no external rendering requests. Hosting providers and external destinations have their own policies and may keep access logs.

All frontend code and build configuration shipped to a browser are readable. Public settings are not a secret store. The `private` package flag prevents accidental npm publication; it does not make a website private.

## Content and resume protection

- The owner explicitly approved the unchanged original resume for download and public source publication. Its phone number and other original PDF contents are therefore public.
- Webpage summaries still omit phone/client details, internal infrastructure, provider identifiers, detailed performance figures, and unprovided personal information. These omissions do not redact the approved PDF.
- The hero and About controls download the same local PDF without an external storage service, backend, or JavaScript requirement. The email-request fallback remains for a build without a public PDF.
- Git ignores other PDFs by default, with one exception for the approved asset. Removing a download link, asset, or approval flag later does not erase already published copies or Git history.
- An enabled download requires explicit file approval, a safe local PDF name, a matching existing asset, and a PDF signature. Other PDFs in `public` fail the build. Symbolic links in publication assets are rejected.
- The release preflight requires public-content approval and a real HTTPS-origin setting. Indexing additionally requires both.
- Owner review remains essential: a boolean cannot prove permission, current employment, external-link availability, or that a PDF contains no sensitive information. Signature checks are not a PDF malware/content sanitizer.

**Noindex, robots rules, and local approval checks are not access control.** They cannot stop someone from uploading the directory directly or retrieving a publicly hosted file. Do not upload unapproved content, even to a nominal preview.

The source-provided LinkedIn URL returned HTTP 999 to automated access. It is not claimed to be independently verified. Email-client launch, mailbox ownership, and delivery are separate from checking a mailto target or clipboard write.

## Browser protections

Finalization generates `_headers` from the actual prerendered HTML:

- Content Security Policy limits scripts, connections, images, and fonts to the application origin.
- Real inline Angular scripts are allowed through their SHA-256 hashes. Script `unsafe-inline` and `unsafe-eval` are not enabled.
- Trusted Types permits Angular's required `angular` and `angular#bundler` policies and requires trusted script sinks in supporting browsers.
- Objects, framing, and form submission are denied; base URLs are restricted to the same origin.
- Nosniff, frame denial, no-referrer, restricted camera/microphone/location/payment/USB permissions, and HTTPS/HSTS protections are emitted.
- Default unapproved/unindexed builds also emit `X-Robots-Tag: noindex, nofollow`, matching the page metadata and robots file.

**Inline-style trade-off:** `style-src` permits inline styles because Angular's prerendered and runtime component styles need them. A strict per-request style nonce would require a different hosting/runtime approach. This permission does not allow inline script, and must not be treated as complete protection against every styling-based attack.

Angular's normal template interpolation/binding handles text and URLs. There is no raw professional-content HTML injection, sanitizer bypass, custom script evaluation, or remotely supplied HTML. The application does not accept arbitrary visitor content for storage or rendering.

CSP hashes and HTML must stay together. Restart the local preview after a rebuild and deploy complete artifacts; host-side script injection or HTML rewriting may otherwise break hydration. Do not weaken CSP to mask an incorrect deployment.

These production headers belong to the finalized static preview/host. The development server is not the production security model.

## Local preview safeguards

The Node helper binds to `127.0.0.1`, serves only the finalized browser directory, and accepts GET/HEAD, not POST. It has real 404 responses, no directory listing, and no source/config serving. Path checks reject traversal, encoded Windows path tricks, null bytes, and symlink escapes. Errors return generic local-preview messages rather than filesystem details.

It is a development/testing utility, not an internet-facing application server. Do not expose it through a public interface or use it as a substitute for a managed HTTPS static host. General-purpose production API concerns such as authentication, request-body validation, email rate limiting, and API CORS are not applicable to a nonexistent API.

Failed project-module navigation has a visible, accessible recovery action that reloads the actual destination. It deliberately retains Angular's normal error reporting rather than hiding a failed navigation. Clipboard permission/API failures retain the direct email option and never display false success.

## Dependency review and maintenance

The complete dependency and runtime-only audits both reported **0 known vulnerabilities on 31 October 2026**:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
```

Adding Angular ESLint initially exposed 18 moderate transitive findings through `minimatch@10.2.6`. Advisory `GHSA-g3hv-75wg-m249` was investigated, and `package.json` explicitly overrides `minimatch` to patched stable **11.0.3**. The full lint/test/build/browser gate passed with that override. Do not remove it without checking the resulting dependency graph and audit; reassess it when upstream tooling incorporates the fix.

The lockfile is part of the project. Review release notes and compatibility before updating packages, use compatible stable Angular/CLI/TypeScript versions, rerun the smallest relevant tests and the release gate, and re-audit before publication. Avoid forced audit fixes and blanket lifecycle-script approval. Restricted npm lifecycle scripts did not prevent the verified builds here; address a specific missing-tool failure rather than globally weakening policy.

Zero known audit findings are not a guarantee of zero defects or vulnerabilities. No external penetration test or security certification is claimed.

Advisory reference: https://github.com/advisories/GHSA-g3hv-75wg-m249

## Third-party materials and licensing

| Material                                                | Treatment                                                                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| DM Sans Variable, Fontsource 5.3.0                      | Self-hosted Latin WOFF2; SIL Open Font License 1.1 retained at `browser\licenses\dm-sans\LICENSE`.               |
| IBM Plex Mono, Fontsource 5.3.0                         | Self-hosted Latin WOFF2; SIL Open Font License 1.1 retained at `browser\licenses\ibm-plex-mono\LICENSE`.         |
| Angular and bundled dependency notices                  | Angular-generated notices copied into `browser\3rdpartylicenses.txt` during finalization.                        |
| Georgia/system fallback fonts                           | Referenced as installed system fonts; their font files are not redistributed.                                    |
| Favicon, geometric illustrations, icons, social artwork | Original project assets, not copied from the reference portfolios or employers.                                  |
| Reference portfolios                                    | Used for content/design analysis only; no source code, branding, photography, or site copy reused.               |
| Professional facts                                      | Supplied by the owner in the resume; source mappings and permission boundaries are in `content-verification.md`. |

Ship the font licenses and generated notices with the complete static artifact, and retain relevant package licenses if redistributing source/dependencies. Do not assume every transitive dependency has the same license.

No overall open-source license has been selected for the owner's project. The npm `private` flag and third-party notices do not grant a blanket license to the original portfolio content/code. The owner can make a separate licensing decision if publishing the source.

## Remaining review

Before public use, confirm content permission and current facts, externally verify the supplied profile, review any approved PDF, and inspect the real host's HTTPS, headers, cache behavior, and logs. Do not enable analytics, tracking, remote widgets, or a contact backend without a separate implementation/privacy review.

Accessibility automation and local Chromium checks do not certify screen-reader behavior, every browser, every device, or the eventual hosting configuration. See `verification.md` for the precise evidence and limitations.
