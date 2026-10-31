import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { resumeRequestHref } from '../content/portfolio';
import { SITE_SETTINGS } from '../content/site-settings';
import { Icon } from './icon';

@Component({
  selector: 'app-resume-link',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (publicResume; as resume) {
      <a class="text-link" [href]="'/' + resume.assetPath" [download]="resume.downloadName">
        Download resume <span class="file-type">PDF</span><app-icon name="download" />
      </a>
    } @else {
      <a class="text-link" [href]="requestHref">
        Request my resume <app-icon name="arrow-up-right" />
      </a>
    }
  `,
  styles: `
    .file-type {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.65rem;
    }
  `,
})
export class ResumeLink {
  private readonly settings = inject(SITE_SETTINGS);
  protected readonly publicResume = this.settings.resume?.publicUseApproved
    ? this.settings.resume
    : null;
  protected readonly requestHref = resumeRequestHref;
}
