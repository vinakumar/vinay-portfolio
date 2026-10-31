import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_SETTINGS } from '../content/site-settings';

interface PageMetadata {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly noIndex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly settings = inject(SITE_SETTINGS);

  update(page: PageMetadata): void {
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({
      name: 'robots',
      content:
        this.settings.indexingEnabled && !page.noIndex ? 'index, follow' : 'noindex, nofollow',
    });

    const existing = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!this.settings.productionUrl || page.noIndex) {
      existing?.remove();
      this.meta.removeTag('property="og:url"');
      this.meta.removeTag('property="og:image"');
      this.meta.removeTag('property="og:image:alt"');
      this.meta.removeTag('name="twitter:image"');
      this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      return;
    }

    const canonical = existing ?? this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = new URL(page.path, this.settings.productionUrl).href;
    if (!existing) {
      this.document.head.append(canonical);
    }
    const image = new URL('/social-preview.png', this.settings.productionUrl).href;
    this.meta.updateTag({ property: 'og:url', content: canonical.href });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({
      property: 'og:image:alt',
      content: 'Vinay Kumar - Senior Software Engineer',
    });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }
}
