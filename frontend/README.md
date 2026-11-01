# Portfolio Angular workspace

The complete setup, architecture, content, privacy, and handover documentation is in `C:\Documents\vinay-portfolio\README.md` and its `docs` directory.

## Local development

Use the verified Node.js 24.19.0 and npm 12.0.2 toolchain:

```powershell
Set-Location 'C:\Documents\vinay-portfolio\frontend'
npm ci
npm start
```

Open http://127.0.0.1:4200/. Stop the server with `Ctrl+C`.

## Complete verification

```powershell
npx playwright install chromium
npm run verify
```

This runs lint, formatting, strict type checks, Angular/Vitest tests, Node tooling tests, the production build, and Playwright tests. Browser tests manage their own preview on port 4173 by default; set `$env:PORT = '4174'` to an unused port if an existing preview must keep running.

Individual suites are `npm test`, `npm run test:tooling`, and `npm run test:e2e`. The last requires a fresh production build and manages its own local preview. `ng e2e` is not configured.

## Production preview

```powershell
npm run build
npm run preview
```

Open http://127.0.0.1:4173/. The deployable directory is `dist\vinay-portfolio\browser`. Restart a manual preview after each rebuild.

Use the npm build wrapper rather than bare `ng build`: it runs the publication checks and generates security headers, the real 404, robots rules, and dependency notices.

## Editing and publication

Professional data: `src\app\content\portfolio.ts`. Public settings: `src\app\content\site-settings.json`. Shared design: `src\styles.scss`. Social image source: `public\social-preview.svg`; regenerate the PNG with `npm run social:render`.

No backend or email credentials are required. The owner-approved original PDF is in `public\resume\Vinay_Kumar_Resume.pdf`; the hero and About sections offer a direct download, including without JavaScript. The PDF and its original contents are public in the source repository. Replace it only with an explicitly approved file and keep its settings/Git ignore exception consistent.

Website-content approval and a real production domain are still required. `npm run release:check` deliberately refuses those unset website settings; PDF approval does not deploy the site or enable indexing. The root README records the current Angular/Node release comparison.

Source repository: https://github.com/vinakumar/vinay-portfolio. The owner selected Vercel; `vercel.json` runs the finalized build and `node static-tools.mjs vercel` to package static assets, routes, and security headers. Either the repository root or `frontend` may be the Vercel Root Directory, using its matching configuration. See `C:\Documents\vinay-portfolio\docs\deployment.md` for exact settings and redeployment checks.
