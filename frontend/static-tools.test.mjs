import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  createCsp,
  createPreviewServer,
  createVercelOutput,
  resolveAssetPath,
  validateResumeAssets,
  validateSettings,
} from './static-tools.mjs';

const localSettings = {
  productionUrl: null,
  publicContentApproved: false,
  indexingEnabled: false,
  resume: null,
};

test('local use is allowed while publication and indexing require explicit approval', () => {
  assert.equal(validateSettings(localSettings), localSettings);
  assert.throws(() => validateSettings(localSettings, { release: true }), /Publication is blocked/);
  assert.throws(
    () => validateSettings({ ...localSettings, indexingEnabled: true }),
    /Indexing requires/,
  );
});

test('production origins cannot contain insecure protocols, credentials, paths, or queries', () => {
  for (const productionUrl of [
    'http://portfolio.example.test',
    'https://user:password@portfolio.example.test',
    'https://portfolio.example.test/path',
    'https://portfolio.example.test?key=value',
    'https://portfolio.example.test#fragment',
    'not-a-url',
  ]) {
    assert.throws(() => validateSettings({ ...localSettings, productionUrl }), /productionUrl/);
  }
  assert.doesNotThrow(() =>
    validateSettings({ ...localSettings, productionUrl: 'https://portfolio.example.test' }),
  );
});

test('resume configuration rejects unapproved, external, or traversing asset paths', () => {
  for (const resume of [
    { assetPath: 'resume/Approved.pdf', downloadName: 'Approved.pdf', publicUseApproved: false },
    { assetPath: '../Private.pdf', downloadName: 'Approved.pdf', publicUseApproved: true },
    {
      assetPath: 'https://example.test/a.pdf',
      downloadName: 'Approved.pdf',
      publicUseApproved: true,
    },
    { assetPath: 'resume/Approved.pdf', downloadName: '../Private.pdf', publicUseApproved: true },
  ]) {
    assert.throws(() => validateSettings({ ...localSettings, resume }), /resume needs/);
  }
});

test('unapproved PDF assets and enabled-but-missing downloads fail the build', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vinay-portfolio-assets-'));
  try {
    const approved = {
      ...localSettings,
      resume: {
        assetPath: 'resume/Approved.pdf',
        downloadName: 'Approved.pdf',
        publicUseApproved: true,
      },
    };
    await assert.rejects(validateResumeAssets(approved, directory), /missing/);
    await mkdir(join(directory, 'resume'));
    await writeFile(join(directory, 'resume', 'Approved.pdf'), 'not a PDF');
    await assert.rejects(validateResumeAssets(approved, directory), /PDF file signature/);
    await writeFile(join(directory, 'resume', 'Approved.pdf'), '%PDF-1.7\nTest fixture only.');
    await validateResumeAssets(approved, directory);
    await assert.rejects(validateResumeAssets(localSettings, directory), /unapproved PDF/);
    await writeFile(join(directory, 'Accidental.PDF'), '%PDF-1.7\nTest fixture only.');
    await assert.rejects(validateResumeAssets(approved, directory), /unapproved PDF/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('CSP hashes real inline content without enabling unsafe inline script or eval', () => {
  const body = 'window.example = true;';
  const csp = createCsp([`<script>${body}</script><script src="main.js"></script>`]);
  assert.ok(csp.includes(`'sha256-${createHash('sha256').update(body).digest('base64')}'`));
  const scriptPolicy = csp.split('; ').find((part) => part.startsWith('script-src'));
  assert.ok(!scriptPolicy.includes('unsafe-inline'));
  assert.ok(!scriptPolicy.includes('unsafe-eval'));
  assert.ok(csp.includes("frame-ancestors 'none'"));
});

test('static path resolution rejects encoded traversal and Windows path tricks', () => {
  const directory = join(tmpdir(), 'vinay-portfolio-path-test');
  for (const path of ['/%2e%2e%2fprivate.txt', '/%5cWindows', '/C%3a/Windows', '/%00', '/%bad']) {
    assert.throws(() => resolveAssetPath(directory, path));
  }
  assert.equal(resolveAssetPath(directory, '/work/a?source=test'), join(directory, 'work', 'a'));
});

test('static preview serves real routes, a real 404, HEAD, and no POST endpoint', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vinay-portfolio-preview-'));
  let server;
  try {
    await writeFile(join(directory, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n');
    await writeFile(join(directory, 'index.html'), '<h1>Home fixture</h1>');
    await writeFile(join(directory, '404.html'), '<h1>Not found fixture</h1>');
    await writeFile(join(directory, 'chunk-abc_def-.js'), '// Hashed asset fixture.');
    await mkdir(join(directory, 'work'));
    await writeFile(join(directory, 'work', 'index.html'), '<h1>Work fixture</h1>');
    server = await createPreviewServer(directory);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await fetch(`${base}/work`)).status, 200);
    const missing = await fetch(`${base}/missing`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Not found fixture/);
    const head = await fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('x-content-type-options'), 'nosniff');
    assert.equal((await fetch(base, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${base}/_headers`)).status, 404);
    assert.equal((await fetch(`${base}/%5cWindows`)).status, 400);
    assert.equal(
      (await fetch(`${base}/chunk-abc_def-.js`)).headers.get('cache-control'),
      'public, max-age=31536000, immutable',
    );
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await rm(directory, { recursive: true, force: true });
  }
});

test('Vercel output publishes finalized pages and PDF with headers, not an SPA catch-all', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vinay-portfolio-vercel-'));
  const source = join(directory, 'browser');
  const output = join(directory, 'output');
  try {
    await mkdir(join(source, 'work', 'project'), { recursive: true });
    await mkdir(join(source, 'resume'));
    const home = '<h1>Home fixture</h1><script>window.example = true;</script>';
    const csp = createCsp([home]);
    await writeFile(
      join(source, '_headers'),
      `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  X-Robots-Tag: noindex, nofollow\n\n/unused\n  Cache-Control: ignored\n`,
    );
    await writeFile(join(source, 'index.html'), home);
    await writeFile(join(source, '404.html'), '<h1>Not found fixture</h1>');
    await writeFile(join(source, 'work', 'project', 'index.html'), '<h1>Project fixture</h1>');
    const pdf = Buffer.from('%PDF-1.7\nApproved fixture only.');
    await writeFile(join(source, 'resume', 'Approved.pdf'), pdf);
    await mkdir(join(output, 'static'), { recursive: true });
    await writeFile(join(output, 'static', 'stale.js'), 'Superseded asset');
    await createVercelOutput(source, output);

    const config = JSON.parse(await readFile(join(output, 'config.json'), 'utf8'));
    assert.equal(config.routes[0].headers['Content-Security-Policy'], csp);
    assert.equal(config.routes[0].headers['X-Robots-Tag'], 'noindex, nofollow');
    for (const [url, destination] of [
      ['/', '/index.html'],
      ['/work/project', '/work/project/index.html'],
      ['/work/project/', '/work/project/index.html'],
    ]) {
      const route = config.routes.find((route) => route.dest && new RegExp(route.src).test(url));
      assert.equal(route.dest, destination);
      assert.equal(
        await readFile(join(output, 'static', destination), 'utf8'),
        await readFile(join(source, destination), 'utf8'),
      );
    }
    assert.deepEqual(config.routes.slice(-2), [
      { handle: 'filesystem' },
      { src: '/.*', dest: '/404.html', status: 404 },
    ]);
    assert.deepEqual(await readFile(join(output, 'static', 'resume', 'Approved.pdf')), pdf);
    await assert.rejects(readFile(join(output, 'static', '_headers')), { code: 'ENOENT' });
    await assert.rejects(readFile(join(output, 'static', 'stale.js')), { code: 'ENOENT' });
    await rm(join(source, '404.html'));
    await assert.rejects(createVercelOutput(source, output), /finalized build/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
