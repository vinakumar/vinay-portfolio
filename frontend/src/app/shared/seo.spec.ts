import { TestBed } from '@angular/core/testing';
import { SITE_SETTINGS, SiteSettings } from '../content/site-settings';
import { Seo } from './seo';

const page = {
  title: 'Test portfolio page',
  description: 'Test description',
  path: '/work/example',
};
const localSettings: SiteSettings = {
  productionUrl: null,
  publicContentApproved: false,
  indexingEnabled: false,
  resume: null,
};

describe('Page metadata', () => {
  it('omits unprovided production URLs and images instead of emitting placeholders', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SITE_SETTINGS, useValue: localSettings }],
    });
    TestBed.inject(Seo).update(page);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      page.description,
    );
  });

  it('updates a single canonical and social URL from an explicitly configured origin', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SITE_SETTINGS,
          useValue: {
            ...localSettings,
            productionUrl: 'https://portfolio.example.test',
            publicContentApproved: true,
            indexingEnabled: true,
          } satisfies SiteSettings,
        },
      ],
    });
    const seo = TestBed.inject(Seo);
    seo.update(page);
    seo.update({ ...page, path: '/work/another' });
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://portfolio.example.test/work/another',
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://portfolio.example.test/social-preview.png',
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index, follow',
    );
    seo.update({ ...page, noIndex: true });
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });
});
