import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import settings from '../src/app/content/site-settings.json';
import { profile, projects } from '../src/app/content/portfolio';
import type { SiteSettings } from '../src/app/content/site-settings';

declare global {
  interface Window {
    portfolioMetrics?: { cls: number; lcp: number };
  }
}

async function openHome(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

async function assertNoOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (
          style.display === 'none' ||
          style.position === 'absolute' ||
          style.position === 'fixed'
        ) {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
      })
      .map((element) => `${element.tagName}.${element.className}`),
  );
  expect(overflow, 'Elements should stay within the viewport').toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    (page.viewportSize()?.width ?? 0) + 1,
  );
}

async function assertAccessible(page: Page): Promise<void> {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    result.violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`homepage layout, assets, accessibility, and navigation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    const failures: string[] = [];
    const remoteRequests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('requestfailed', (request) => failures.push(request.url()));
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173')) remoteRequests.push(request.url());
    });
    await openHome(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering,');
    await expect(page.locator('.project-card')).toHaveCount(4);
    await assertNoOverflow(page);
    await assertAccessible(page);
    await page.screenshot({
      path: testInfo.outputPath(`home-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    if (width === 375 || width === 1440) {
      await page.screenshot({
        path: testInfo.outputPath(`hero-${width}.png`),
        animations: 'disabled',
      });
    }
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    if (width <= 800) {
      const menu = page.getByRole('button', { name: /^(Menu|Close)$/ });
      await expect(nav).toBeHidden();
      await expect(menu).toHaveAccessibleName('Menu');
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(menu).toHaveAccessibleName('Close');
      await expect(nav).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await expect(nav).toBeHidden();
      await menu.click();
    }
    await nav.getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL(/\/#work$/);
    const title = page.getByRole('heading', { name: 'Engineering in context.' });
    await expect(title).toBeFocused();
    await expect(page.locator('#primary-navigation a[href="/#work"]')).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect
      .poll(async () =>
        title.evaluate((element) => {
          const header = document.querySelector('.site-header');
          return (
            element.getBoundingClientRect().top >= (header?.getBoundingClientRect().bottom ?? 0)
          );
        }),
      )
      .toBe(true);
    if (width <= 800) await expect(nav).toBeHidden();
    await assertNoOverflow(page);
    expect(errors).toEqual([]);
    expect(failures).toEqual([]);
    expect(remoteRequests).toEqual([]);
  });
}

test('keyboard skip link and every primary anchor lead to usable content', async ({ page }) => {
  await openHome(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect
    .poll(() => page.locator('main').evaluate((main) => main.contains(document.activeElement)))
    .toBe(true);
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  for (const [label, id] of [
    ['Experience', 'experience'],
    ['Expertise', 'expertise'],
    ['About', 'about'],
    ['Contact', 'contact'],
  ]) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator(`#${id} h2`).first()).toBeFocused();
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expect
      .poll(() => nav.getByRole('link', { name: label, exact: true }).getAttribute('aria-current'))
      .toBe('location');
  }
  await page.getByRole('link', { name: 'Back to top' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

for (const project of projects) {
  test(`project detail, deep link, metadata, and accessibility: ${project.slug}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`/work/${project.slug}`, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
    await expect(page).toHaveTitle(`${project.title} | Vinay Kumar`);
    await expect(page.locator('.project-meta')).toContainText(project.employer);
    await expect(
      page.getByText('No public repository or demo is linked for this work.'),
    ).toBeVisible();
    await assertAccessible(page);
    await page.setViewportSize({ width: 320, height: 900 });
    await assertNoOverflow(page);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
    expect(errors).toEqual([]);
  });
}

test('project cards, next project, browser history, and the return link work together', async ({
  page,
}, testInfo) => {
  await openHome(page);
  await page.getByRole('link', { name: 'Enterprise asset management', exact: true }).click();
  await expect(page).toHaveURL(/\/work\/enterprise-asset-management$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({
    path: testInfo.outputPath('project-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('link', { name: /Next \/ Selected work 02/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ticketing and identity services',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Enterprise asset management');
  await page.getByRole('link', { name: 'Back to selected work' }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect(page.getByRole('heading', { name: 'Engineering in context.' })).toBeFocused();
});

test('a failed project-page load offers an accessible full-page retry', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await openHome(page);
  await page.route('**/chunk-*.js', (route) => route.abort());
  await page.getByRole('link', { name: 'Enterprise asset management', exact: true }).click();
  const notice = page.getByRole('alert');
  await expect(notice).toContainText("This page couldn't load.");
  const retry = notice.getByRole('link', { name: 'Reload page' });
  await expect(retry).toHaveAttribute('href', '/work/enterprise-asset-management');
  await expect(retry).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering,');
  await assertNoOverflow(page);
  await assertAccessible(page);

  await page.unroute('**/chunk-*.js');
  await retry.click();
  await expect(page).toHaveURL(/\/work\/enterprise-asset-management$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Enterprise asset management');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('contact links use the supplied address and clipboard feedback is backed by a real write', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openHome(page);
  const email = page.getByRole('link', { name: 'Write an email' });
  await expect(email).toHaveAttribute('href', `mailto:${profile.email}`);
  await expect(page.getByRole('link', { name: 'Connect on LinkedIn' })).toHaveAttribute(
    'href',
    profile.linkedIn,
  );
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('status')).toHaveText('Email address copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
});

test('clipboard denial never displays a false success and keeps the direct contact link', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
    });
  });
  await openHome(page);
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.getByRole('status')).toContainText('Select the address above');
  await expect(page.getByRole('status')).not.toContainText('Email address copied.');
  await expect(page.getByRole('link', { name: 'Write an email' })).toHaveAttribute(
    'href',
    `mailto:${profile.email}`,
  );
});

test('resume is either a real approved PDF download or an honest email request', async ({
  page,
  request,
}) => {
  await openHome(page);
  const resume = (settings as SiteSettings).resume;
  if (resume) {
    const response = await request.get(`/${resume.assetPath}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    const downloading = page.waitForEvent('download');
    await page.getByRole('link', { name: /Download resume/ }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe(resume.downloadName);
    const path = await download.path();
    expect(path).not.toBeNull();
    expect((await readFile(path as string)).subarray(0, 5).toString()).toBe('%PDF-');
  } else {
    await expect(page.locator('a[download]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Request my resume' })).toHaveAttribute(
      'href',
      /^mailto:.*subject=Request%20for%20your%20resume$/,
    );
    expect((await request.get('/resume/Vinay_Kumar_Resume.pdf')).status()).toBe(404);
  }
});

test('reduced motion removes entrance animations and smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  expect(
    await page.locator('.hero-copy').evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  );
});

test('prerendered content and native links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering,');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy email address' })).toBeHidden();
    await page.getByRole('link', { name: 'Enterprise asset management', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Enterprise asset management');
  } finally {
    await context.close();
  }
});

test('unknown pages and assets return 404 with useful navigation and no indexing', async ({
  page,
  request,
}) => {
  const response = await page.goto('/a-page-that-does-not-exist', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText("This page isn't");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect((await request.get('/missing-image.png')).status()).toBe(404);
  expect((await request.get('/src/app/content/site-settings.json')).status()).toBe(404);
  await page.getByRole('link', { name: 'Back to the portfolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering,');
});

test('production HTML, assets, licenses, and security headers are actually served', async ({
  request,
  page,
}) => {
  const response = await request.get('/');
  const html = await response.text();
  expect(html).toContain('Engineering,');
  expect(html).toContain('Enterprise asset management');
  expect(html).not.toContain('VinayPortfolio');
  const csp = response.headers()['content-security-policy'] ?? '';
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp.split(';').find((directive) => directive.includes('script-src'))).not.toContain(
    'unsafe-inline',
  );
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  for (const asset of [
    '/favicon.svg',
    '/social-preview.png',
    '/3rdpartylicenses.txt',
    '/licenses/dm-sans/LICENSE',
    '/licenses/ibm-plex-mono/LICENSE',
  ]) {
    expect((await request.get(asset)).status()).toBe(200);
  }
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain(settings.indexingEnabled ? 'Allow: /' : 'Disallow: /');
  if (!settings.productionUrl) {
    await openHome(page);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    expect((await request.get('/sitemap.xml')).status()).toBe(404);
  }
});

test('an unknown project deep link returns a usable 404 without hydration errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/work/not-a-project', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText("This page isn't");
  await page.getByRole('link', { name: 'Back to the portfolio' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineering,');
  expect(errors).toEqual([]);
});

test('self-hosted fonts load without substantial layout shift', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0 };
    Object.defineProperty(window, 'portfolioMetrics', { value: metrics });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      metrics.lcp = list.getEntries().at(-1)?.startTime ?? 0;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await openHome(page);
  const metrics = await page.evaluate(() => {
    const measured = window.portfolioMetrics;
    if (!measured) throw new Error('The performance observers did not initialize.');
    return {
      ...measured,
      bodyFontLoaded: document.fonts.check('16px "DM Sans Variable"'),
      labelFontLoaded: document.fonts.check('12px "IBM Plex Mono"'),
    };
  });
  const metricsFile = testInfo.outputPath('local-render-metrics.json');
  await writeFile(metricsFile, JSON.stringify(metrics, null, 2));
  await testInfo.attach('local-render-metrics.json', {
    path: metricsFile,
    contentType: 'application/json',
  });
  expect(metrics.bodyFontLoaded).toBe(true);
  expect(metrics.labelFontLoaded).toBe(true);
  expect(metrics.cls).toBeLessThan(0.1);
});

test('the mobile disclosure works with touch input', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Menu', exact: true }).tap();
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Contact', exact: true }).tap();
    await expect(nav).toBeHidden();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(page.getByRole('heading', { name: /Let's talk/ })).toBeFocused();
    await expect(page.locator('#primary-navigation a[href="/#contact"]')).toHaveAttribute(
      'aria-current',
      'location',
    );
  } finally {
    await context.close();
  }
});
