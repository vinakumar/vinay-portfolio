import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';

describe('Project routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows a real contribution summary without invented external source or demo links', async () => {
    const harness = await RouterTestingHarness.create('/work/enterprise-asset-management');
    const element = harness.routeNativeElement;
    expect(element?.querySelector('h1')?.textContent).toBe('Enterprise asset management');
    expect(element?.querySelectorAll('.contribution-list li')).toHaveLength(4);
    expect(element?.textContent).toContain('No public repository or demo is linked');
    expect(element?.querySelectorAll('a[href^="https:"]')).toHaveLength(0);
    expect(document.title).toBe('Enterprise asset management | Vinay Kumar');
  });

  it('updates content and metadata when moving between projects in the same route component', async () => {
    const harness = await RouterTestingHarness.create('/work/enterprise-asset-management');
    await harness.navigateByUrl('/work/utility-payments');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
      'Utility payments and notifications',
    );
    expect(harness.routeNativeElement?.textContent).toContain('more than one application');
    expect(document.title).toBe('Utility payments and notifications | Vinay Kumar');
  });

  it('recovers from unknown slugs without stale content or misleading metadata', async () => {
    const harness = await RouterTestingHarness.create('/work/not-a-project');
    expect(harness.routeNativeElement?.textContent).toContain("This page isn't");
    expect(document.title).toBe('Page not found | Vinay Kumar');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
    await harness.navigateByUrl('/work/ticketing-and-identity');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
      'Ticketing and identity services',
    );
    expect(document.title).toBe('Ticketing and identity services | Vinay Kumar');
  });
});
