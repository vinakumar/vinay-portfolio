import { TestBed } from '@angular/core/testing';
import { SITE_SETTINGS, SiteSettings } from '../content/site-settings';
import { ResumeLink } from './resume-link';

const settings: SiteSettings = {
  productionUrl: null,
  publicContentApproved: false,
  indexingEnabled: false,
  resume: null,
};

describe('Resume publication gate', () => {
  it('does not expose a configured PDF when its public-use approval is false', async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeLink],
      providers: [
        {
          provide: SITE_SETTINGS,
          useValue: {
            ...settings,
            resume: {
              assetPath: 'resume/Unapproved.pdf',
              downloadName: 'Unapproved.pdf',
              publicUseApproved: false,
            },
          } satisfies SiteSettings,
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ResumeLink);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('a[download]')).toBeNull();
    expect(element.querySelector('a')?.textContent).toContain('Request my resume');
  });

  it('shows a working request link and no download before approval', async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeLink],
      providers: [{ provide: SITE_SETTINGS, useValue: settings }],
    }).compileComponents();
    const fixture = TestBed.createComponent(ResumeLink);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(link?.textContent).toContain('Request my resume');
    expect(link?.getAttribute('href')).toContain('mailto:vinaychauhan.22@outlook.com?subject=');
    expect(link?.hasAttribute('download')).toBe(false);
  });

  it('uses the configured local asset and meaningful filename after explicit approval', async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeLink],
      providers: [
        {
          provide: SITE_SETTINGS,
          useValue: {
            ...settings,
            resume: {
              assetPath: 'resume/Approved.pdf',
              downloadName: 'Approved.pdf',
              publicUseApproved: true,
            },
          } satisfies SiteSettings,
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ResumeLink);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(link?.textContent).toContain('Download resume');
    expect(link?.getAttribute('href')).toBe('/resume/Approved.pdf');
    expect(link?.getAttribute('download')).toBe('Approved.pdf');
  });
});
