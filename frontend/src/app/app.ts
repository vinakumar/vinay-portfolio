import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Header } from './layout/header';
import { Footer } from './layout/footer';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <app-header />
    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
    @if (failedNavigation(); as failedUrl) {
      <div class="navigation-error" role="alert">
        <p><strong>This page couldn't load.</strong></p>
        <p>Check your connection, then reload this page.</p>
        <div class="navigation-error-actions">
          <a class="button" [href]="failedUrl">Reload page</a>
          <button class="button button-secondary" type="button" (click)="dismissNavigationError()">
            Dismiss
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .skip-link {
      position: fixed;
      z-index: 100;
      top: 0.75rem;
      left: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 3px;
      background: var(--ink);
      color: var(--paper);
      transform: translateY(-200%);
    }
    .skip-link:focus {
      transform: translateY(0);
    }
    main:focus {
      outline: none;
    }
    .navigation-error {
      position: fixed;
      z-index: 50;
      right: 1rem;
      bottom: 1rem;
      display: grid;
      width: min(32rem, calc(100% - 2rem));
      gap: 0.75rem;
      padding: 1.25rem;
      border: 1px solid var(--ink);
      border-radius: 4px;
      background: var(--paper);
      box-shadow: 0 0.5rem 2rem #172f2d20;
    }
    .navigation-error-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
  `,
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private failedNavigationTrigger: HTMLElement | null = null;
  protected readonly failedNavigation = signal<string | null>(null);

  constructor() {
    let initialNavigationComplete = this.router.navigated;
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.failedNavigation.set(null);
        this.failedNavigationTrigger = null;
        return;
      }
      if (event instanceof NavigationError) {
        this.failedNavigationTrigger = this.document.activeElement as HTMLElement | null;
        this.failedNavigation.set(event.url);
        afterNextRender(
          () =>
            this.document
              .querySelector<HTMLAnchorElement>('.navigation-error a')
              ?.focus({ preventScroll: true }),
          { injector: this.injector },
        );
        return;
      }
      if (!(event instanceof NavigationEnd)) return;
      if (!initialNavigationComplete) {
        initialNavigationComplete = true;
        return;
      }
      const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment;
      afterNextRender(
        () => {
          const section = fragment ? this.document.getElementById(fragment) : null;
          const heading = section?.querySelector<HTMLElement>('h1, h2');
          const target =
            heading ??
            section ??
            this.document.querySelector<HTMLElement>('main h1') ??
            this.document.getElementById('main-content');
          target?.focus({ preventScroll: true });
        },
        { injector: this.injector },
      );
    });
  }

  protected dismissNavigationError(): void {
    this.failedNavigation.set(null);
    if (this.failedNavigationTrigger?.isConnected) {
      this.failedNavigationTrigger.focus({ preventScroll: true });
    }
    this.failedNavigationTrigger = null;
  }
}
