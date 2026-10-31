import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Seo } from '../shared/seo';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container not-found" aria-labelledby="not-found-title">
      <span class="eyebrow">404 / A small detour</span>
      <h1 id="not-found-title" tabindex="-1">
        This page isn't<br /><em class="editorial">part of the plan.</em>
      </h1>
      <p>
        The link may be out of date, or the page may not exist. The portfolio is still right here.
      </p>
      <a class="button" routerLink="/">Back to the portfolio <app-icon name="arrow-right" /></a>
    </section>
  `,
  styles: `
    .not-found {
      min-height: 65vh;
      padding-block: 5rem;
    }
    h1 {
      margin-top: 1.5rem;
      font-size: clamp(2.5rem, 6vw, 5rem);
    }
    p {
      max-width: 32rem;
      margin-block: 1.75rem 2rem;
      color: var(--muted);
    }
  `,
})
export class NotFound {
  constructor() {
    inject(Seo).update({
      title: 'Page not found | Vinay Kumar',
      description:
        "This page could not be found. Return to Vinay Kumar's software engineering portfolio.",
      path: '/not-found',
      noIndex: true,
    });
  }
}
