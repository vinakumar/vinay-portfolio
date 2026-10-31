import { ChangeDetectionStrategy, Component } from '@angular/core';
import { certifications, qualifications } from '../content/portfolio';
import { ResumeLink } from '../shared/resume-link';

@Component({
  selector: 'app-about',
  imports: [ResumeLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="about" class="section about-section" aria-labelledby="about-title">
      <div class="container">
        <div class="about-intro">
          <div>
            <span class="eyebrow">04 / A little more context</span>
            <h2 id="about-title" tabindex="-1">
              Beyond the<br /><em class="editorial">technology list.</em>
            </h2>
          </div>
          <div class="about-copy">
            <p>
              My work spans enterprise asset management, ticketing, utility payments, and document
              workflows. Across those domains, I work on the APIs, integrations, and application
              details that connect the pieces.
            </p>
            <p>
              That work extends beyond implementation: investigating production issues, improving
              data access, writing tests, and reviewing changes. At Ticketmaster, it also included
              mentoring junior engineers on .NET practices and debugging.
            </p>
            <app-resume-link />
          </div>
        </div>
        <div class="qualifications">
          <div>
            <h3>Education</h3>
            @for (qualification of qualifications; track qualification.shortName) {
              <div class="degree">
                <span class="degree-year">{{ qualification.year }}</span>
                <div>
                  <h4>{{ qualification.degree }}</h4>
                  <p>{{ qualification.institution }}</p>
                </div>
                <span class="degree-abbreviation">{{ qualification.shortName }}</span>
              </div>
            }
          </div>
          <div>
            <h3>Training &amp; certifications</h3>
            <ul class="certifications">
              @for (certification of certifications; track certification) {
                <li>{{ certification }}</li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './about.scss',
})
export class About {
  protected readonly qualifications = qualifications;
  protected readonly certifications = certifications;
}
