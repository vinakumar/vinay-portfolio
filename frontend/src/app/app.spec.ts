import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('Portfolio shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the real homepage with a skip link and named navigation', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('a[href="#main-content"]')?.textContent).toContain(
      'Skip to content',
    );
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Primary navigation');
    expect(element.querySelector('main h1')?.textContent).toContain('Engineering,');
    expect(element.querySelectorAll('main h1')).toHaveLength(1);
    expect(element.querySelectorAll('.project-card')).toHaveLength(4);
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps the shared navigation while replacing the page on a project route', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/work/ticketing-and-identity');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('main h1')?.textContent).toBe('Ticketing and identity services');
    expect(element.querySelector('header nav')).not.toBeNull();
    expect(element.querySelector('footer')).not.toBeNull();
    expect(element.querySelector('#home')).toBeNull();
  });

  it('offers a real reload after a route fails and restores focus when dismissed', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    router.resetConfig([
      {
        path: 'unavailable',
        loadComponent: () => Promise.reject(new Error('Module unavailable')),
      },
      ...routes,
    ]);
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLAnchorElement>(
      'a[href="/work/enterprise-asset-management"]',
    );
    expect(trigger).not.toBeNull();
    trigger?.focus();

    await expect(router.navigateByUrl('/unavailable')).rejects.toThrow('Module unavailable');
    await fixture.whenStable();
    const retry = element.querySelector<HTMLAnchorElement>('.navigation-error a');
    expect(retry?.getAttribute('href')).toBe('/unavailable');
    expect(document.activeElement).toBe(retry);
    expect(element.querySelector('main h1')?.textContent).toContain('Engineering,');

    element.querySelector<HTMLButtonElement>('.navigation-error button')?.click();
    await fixture.whenStable();
    expect(element.querySelector('.navigation-error')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
