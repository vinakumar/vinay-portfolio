import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { emailHref, profile } from '../content/portfolio';
import { Clipboard } from '../shared/clipboard';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-contact',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="section dark-surface" aria-labelledby="contact-title">
      <div class="container contact-layout">
        <div>
          <span class="eyebrow">05 / The next conversation</span>
          <h2 id="contact-title" tabindex="-1">
            Let's talk<br /><em class="editorial">about the work.</em>
          </h2>
          <p class="contact-intro">
            For engineering opportunities or a conversation about .NET, APIs, and reliable systems,
            get in touch.
          </p>
          <a class="button contact-button" [href]="emailHref"
            >Write an email <app-icon name="arrow-up-right"
          /></a>
        </div>
        <div class="contact-details">
          <span class="eyebrow">Direct, human, no middle layer.</span>
          <a class="email-address" [href]="emailHref"
            >{{ profile.email }}<app-icon name="arrow-up-right"
          /></a>
          <button
            class="copy-button"
            type="button"
            [disabled]="copyState() === 'copying'"
            (click)="copyEmail()"
          >
            <app-icon [name]="copyState() === 'copied' ? 'check' : 'copy'" />
            {{ copyState() === 'copying' ? 'Copying email...' : 'Copy email address' }}
          </button>
          <p class="copy-status" role="status">
            @if (copyState() === 'copied') {
              Email address copied.
            } @else if (copyState() === 'failed') {
              Copy wasn't available. Select the address above, or use the email link.
            }
          </p>
          <div class="contact-other">
            <a
              class="text-link"
              [href]="profile.linkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect on LinkedIn <app-icon name="arrow-up-right" /><span class="sr-only">
                (new tab)</span
              >
            </a>
            <span class="contact-location">{{ profile.location }}</span>
          </div>
          <p class="privacy-note">
            Email links open your email app. This site does not send, collect, or store messages.
          </p>
        </div>
      </div>
    </section>
  `,
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly profile = profile;
  protected readonly emailHref = emailHref;
  protected readonly copyState = signal<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  private readonly clipboard = inject(Clipboard);

  protected async copyEmail(): Promise<void> {
    if (this.copyState() === 'copying') {
      return;
    }
    this.copyState.set('copying');
    try {
      await this.clipboard.write(profile.email);
      this.copyState.set('copied');
    } catch {
      this.copyState.set('failed');
    }
  }
}
