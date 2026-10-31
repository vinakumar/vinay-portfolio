import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { profile } from '../content/portfolio';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="container footer">
      <div>
        <span class="footer-name">{{ profile.name }}</span>
        <span class="footer-note">&copy; {{ year }}. Thoughtfully built with Angular.</span>
      </div>
      <div class="footer-links">
        <a class="text-link" [href]="profile.linkedIn" target="_blank" rel="noopener noreferrer">
          LinkedIn <app-icon name="arrow-up-right" /><span class="sr-only"> (new tab)</span>
        </a>
        <a class="text-link" routerLink="/" fragment="home">
          Back to top <app-icon name="arrow-up" />
        </a>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding-block: 2rem;
    }
    .footer-name {
      display: block;
      font-size: 0.875rem;
      font-weight: 550;
    }
    .footer-note {
      display: block;
      margin-top: 0.3rem;
      color: var(--muted);
      font-size: 0.75rem;
    }
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
    }
  `,
})
export class Footer {
  protected readonly profile = profile;
  protected readonly year = new Date().getFullYear();
}
