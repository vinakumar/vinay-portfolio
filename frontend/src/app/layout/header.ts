import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Icon } from '../shared/icon';
import { profile } from '../content/portfolio';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
    '(window:scroll)': 'requestSectionUpdate()',
    '(window:resize)': 'requestSectionUpdate()',
  },
})
export class Header {
  protected readonly profile = profile;
  protected readonly menuOpen = signal(false);
  protected readonly activeSection = signal('');
  protected readonly sections = [
    { id: 'work', label: 'Work' },
    { id: 'experience', label: 'Experience' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private sectionElements: HTMLElement[] = [];
  private projectPage = false;
  private animationFrame: number | null = null;

  constructor() {
    afterNextRender(() => {
      this.refreshSections();
      this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.closeMenu();
          afterNextRender(() => this.refreshSections(), { injector: this.injector });
        });
    });
    this.destroyRef.onDestroy(() => {
      if (this.animationFrame !== null) {
        this.document.defaultView?.cancelAnimationFrame(this.animationFrame);
      }
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(restoreFocus = false): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      if (restoreFocus) {
        this.menuToggle()?.nativeElement.focus();
      }
    }
  }

  protected requestSectionUpdate(): void {
    const view = this.document.defaultView;
    if (!view || this.animationFrame !== null) {
      return;
    }
    if (!view.requestAnimationFrame) {
      this.updateActiveSection();
      return;
    }
    this.animationFrame = view.requestAnimationFrame(() => {
      this.animationFrame = null;
      this.updateActiveSection();
    });
  }

  private refreshSections(): void {
    this.projectPage = this.document.querySelector('article.project-detail') !== null;
    this.sectionElements = this.sections
      .map((section) => this.document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    this.updateActiveSection();
  }

  private updateActiveSection(): void {
    if (this.projectPage) {
      this.activeSection.set('work');
      return;
    }
    const view = this.document.defaultView;
    if (!view || this.sectionElements.length === 0) {
      this.activeSection.set('');
      return;
    }
    const atBottom =
      Math.ceil(view.scrollY + view.innerHeight) >= this.document.documentElement.scrollHeight - 1;
    const current = atBottom
      ? this.sectionElements.at(-1)
      : this.sectionElements
          .filter((element) => element.getBoundingClientRect().top <= view.innerHeight * 0.4)
          .at(-1);
    this.activeSection.set(current?.id ?? '');
  }
}
