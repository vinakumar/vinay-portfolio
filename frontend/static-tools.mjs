import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const publicDirectory = join(root, 'public');
export const buildDirectory = join(root, 'dist', 'vinay-portfolio', 'browser');
const settingsFile = join(root, 'src', 'app', 'content', 'site-settings.json');

export function validateSettings(settings, { release = false } = {}) {
  if (
    !settings ||
    typeof settings.publicContentApproved !== 'boolean' ||
    typeof settings.indexingEnabled !== 'boolean'
  ) {
    throw new Error('Set explicit boolean publicContentApproved and indexingEnabled settings.');
  }
  if (settings.productionUrl !== null) {
    let url;
    try {
      url = new URL(settings.productionUrl);
    } catch {
      throw new Error('productionUrl must be null or a real, absolute HTTPS origin.');
    }
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    ) {
      throw new Error(
        'productionUrl must be an HTTPS origin without credentials, paths, or queries.',
      );
    }
  }
  if (settings.indexingEnabled && (!settings.publicContentApproved || !settings.productionUrl)) {
    throw new Error('Indexing requires public-content approval and a real production URL.');
  }
  if (settings.resume !== null) {
    const resume = settings.resume;
    if (
      !resume ||
      resume.publicUseApproved !== true ||
      !/^resume\/[a-zA-Z0-9_-]+\.pdf$/.test(resume.assetPath) ||
      !/^[a-zA-Z0-9_-]+\.pdf$/.test(resume.downloadName)
    ) {
      throw new Error('A resume needs explicit public-use approval and safe, local PDF filenames.');
    }
  }
  if (release && (!settings.publicContentApproved || !settings.productionUrl)) {
    throw new Error(
      'Publication is blocked: approve the public content and set the real production URL first.',
    );
  }
  return settings;
}

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error('Symbolic links are not allowed in static publication assets.');
    }
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

export async function validateResumeAssets(settings, directory = publicDirectory) {
  const allowed = settings.resume ? resolve(directory, settings.resume.assetPath) : null;
  const pdfs = (await filesUnder(directory)).filter(
    (file) => extname(file).toLowerCase() === '.pdf',
  );
  if (pdfs.some((file) => file !== allowed)) {
    throw new Error('An unapproved PDF was found in public assets. Remove it before building.');
  }
  if (allowed) {
    let bytes;
    try {
      bytes = await readFile(allowed);
    } catch {
      throw new Error('The approved resume file is missing from public assets.');
    }
    if (bytes.subarray(0, 5).toString() !== '%PDF-') {
      throw new Error('The configured resume does not have a PDF file signature.');
    }
  }
}

async function loadSettings(options) {
  const settings = validateSettings(JSON.parse(await readFile(settingsFile, 'utf8')), options);
  await validateResumeAssets(settings);
  return settings;
}

export function createCsp(htmlDocuments) {
  const hashes = new Set();
  for (const html of htmlDocuments) {
    for (const match of html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      hashes.add(`'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`);
    }
  }
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    "connect-src 'self'",
    "img-src 'self'",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    'trusted-types angular angular#bundler',
    "require-trusted-types-for 'script'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function resolveAssetPath(directory, requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname);
  if (
    pathname.includes('\\') ||
    pathname.includes('\0') ||
    pathname.includes(':') ||
    pathname.split('/').includes('..')
  ) {
    throw new Error('Invalid path.');
  }
  const candidate = resolve(directory, `.${pathname}`);
  const local = relative(directory, candidate);
  if (local.startsWith(`..${sep}`) || local === '..' || isAbsolute(local)) {
    throw new Error('Invalid path.');
  }
  return candidate;
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
}

async function finalizeBuild() {
  const settings = await loadSettings();
  await copyFile(join(buildDirectory, 'not-found', 'index.html'), join(buildDirectory, '404.html'));
  await copyFile(
    join(dirname(buildDirectory), '3rdpartylicenses.txt'),
    join(buildDirectory, '3rdpartylicenses.txt'),
  );
  // Real prerendered routes and a 404 replace the CLI's unused CSR fallback.
  await unlink(join(buildDirectory, 'index.csr.html')).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  const htmlPaths = (await filesUnder(buildDirectory)).filter((path) => path.endsWith('.html'));
  const htmlDocuments = await Promise.all(htmlPaths.map((path) => readFile(path, 'utf8')));
  const csp = createCsp(htmlDocuments);
  if (csp.length > 1950) {
    throw new Error('CSP exceeds the static host header limit; review build-time inline scripts.');
  }
  const headers = [
    '/*',
    `  Content-Security-Policy: ${csp}`,
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '  Referrer-Policy: no-referrer',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    '  Strict-Transport-Security: max-age=31536000',
    ...(!settings.indexingEnabled ? ['  X-Robots-Tag: noindex, nofollow'] : []),
    '',
    '/',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/work/*',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/404.html',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/*.js',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/*.css',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/media/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n');
  await writeFile(join(buildDirectory, '_headers'), headers);
  const sitemapEnabled = settings.indexingEnabled && settings.productionUrl;
  const robots = sitemapEnabled
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', settings.productionUrl).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  await writeFile(join(buildDirectory, 'robots.txt'), robots);
  if (sitemapEnabled) {
    const urls = htmlPaths
      .map((path) => relative(buildDirectory, path).split(sep).join('/'))
      .filter((path) => path.endsWith('index.html') && !path.startsWith('not-found/'))
      .map((path) => `/${path.slice(0, -'index.html'.length).replace(/\/$/, '')}`)
      .map((path) => new URL(path, settings.productionUrl).href);
    await writeFile(
      join(buildDirectory, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`,
    );
  }
  if (!existsSync(join(buildDirectory, 'social-preview.png'))) {
    throw new Error(
      'The social preview image is missing. Run npm run social:render before building.',
    );
  }
  console.log(
    `Prepared ${htmlPaths.length} HTML documents, a real 404, security headers, and robots.txt.`,
  );
  console.log(
    settings.publicContentApproved
      ? 'Public content is marked approved.'
      : 'Local preview build. Public-content approval is still required.',
  );
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function readStaticHeaders(directory) {
  const headerFile = await readFile(join(directory, '_headers'), 'utf8');
  return Object.fromEntries(
    headerFile
      .split('\n\n')[0]
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const colon = line.indexOf(':');
        return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
      }),
  );
}

export async function createVercelOutput(
  directory = buildDirectory,
  outputDirectory = resolve('.vercel', 'output'),
) {
  const headers = await readStaticHeaders(directory);
  const files = await filesUnder(directory);
  if (
    !files.includes(join(directory, 'index.html')) ||
    !files.includes(join(directory, '404.html'))
  ) {
    throw new Error('Vercel output requires a finalized build with a homepage and real 404.');
  }
  const staticDirectory = join(outputDirectory, 'static');
  await rm(staticDirectory, { recursive: true, force: true });
  await mkdir(staticDirectory, { recursive: true });
  const htmlRoutes = [];
  for (const file of files) {
    const path = relative(directory, file).split(sep).join('/');
    if (path === '_headers') continue;
    const destination = join(staticDirectory, path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(file, destination);
    if (path === 'index.html' || path.endsWith('/index.html')) {
      const route = `/${path.slice(0, -'index.html'.length).replace(/\/$/, '')}`;
      htmlRoutes.push({
        src: route === '/' ? '^/$' : `^${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`,
        dest: `/${path}`,
        headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
      });
    }
  }
  const config = {
    version: 3,
    routes: [
      { src: '/.*', headers, continue: true },
      {
        src: '^/.*-[A-Za-z0-9_-]{8}\\.(?:js|css|woff2?)$',
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        continue: true,
      },
      {
        src: '^/resume/.*\\.pdf$',
        headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
        continue: true,
      },
      ...htmlRoutes,
      { handle: 'filesystem' },
      { src: '/.*', dest: '/404.html', status: 404 },
    ],
  };
  await writeFile(join(outputDirectory, 'config.json'), `${JSON.stringify(config, null, 2)}\n`);
  console.log('Prepared Vercel Build Output API v3: static pages, assets, headers, and real 404s.');
}

export async function createPreviewServer(directory = buildDirectory) {
  const headers = await readStaticHeaders(directory);
  return createServer(async (request, response) => {
    const send = (status, body, type = 'text/plain; charset=utf-8', extra = {}) => {
      response.writeHead(status, {
        ...headers,
        'Content-Type': type,
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-cache',
        ...extra,
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    };
    if (!['GET', 'HEAD'].includes(request.method)) {
      send(405, 'Method not allowed.', undefined, { Allow: 'GET, HEAD' });
      return;
    }
    let candidate;
    try {
      candidate = resolveAssetPath(directory, request.url ?? '/');
    } catch {
      send(400, 'Invalid request path.');
      return;
    }
    try {
      const segments = relative(directory, candidate).split(sep);
      if (segments.some((segment) => segment.startsWith('.') || segment.startsWith('_'))) {
        send(404, 'Not found.');
        return;
      }
      let file;
      try {
        const info = await stat(candidate);
        file = info.isDirectory() ? join(candidate, 'index.html') : candidate;
        const resolved = await realpath(file);
        if (relative(directory, resolved).startsWith('..')) {
          send(403, 'Forbidden.');
          return;
        }
      } catch (error) {
        if (!['ENOENT', 'ENOTDIR'].includes(error.code)) {
          throw error;
        }
        file = null;
      }
      if (!file) {
        send(404, await readFile(join(directory, '404.html')), contentTypes['.html']);
        return;
      }
      const bytes = await readFile(file);
      const immutable = /-[A-Z0-9_-]{8}\.(?:js|css|woff2?)$/i.test(file);
      send(200, bytes, contentTypes[extname(file)] ?? 'application/octet-stream', {
        'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      });
    } catch {
      send(500, 'The local preview could not serve this page.');
    }
  });
}

async function serve() {
  const port = Number(process.env.PORT ?? 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  const server = await createPreviewServer();
  server.on('error', (error) => {
    console.error(`Preview could not start: ${error.code ?? 'unknown error'}.`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () =>
    console.log(`Portfolio preview: http://127.0.0.1:${port}`),
  );
}

async function renderSocial() {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL,
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    const svg = await readFile(join(publicDirectory, 'social-preview.svg'), 'utf8');
    await page.setContent(
      `<style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}</style>${svg}`,
    );
    await page.screenshot({ path: join(publicDirectory, 'social-preview.png') });
    console.log('Rendered the original 1200 x 630 social preview locally.');
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const commands = {
    check: () =>
      loadSettings().then(() => console.log('Content settings and public-asset checks passed.')),
    finalize: finalizeBuild,
    vercel: () => createVercelOutput(),
    serve,
    release: () =>
      loadSettings({ release: true }).then(() =>
        console.log('Publication settings approved. Run npm run verify before deployment.'),
      ),
    social: renderSocial,
  };
  try {
    const command = commands[process.argv[2]];
    if (!command) {
      throw new Error('Use check, finalize, vercel, serve, release, or social.');
    }
    await command();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
