import { ChangeDetectionStrategy, Component } from '@angular/core';
import { experiences } from '../content/portfolio';

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="experience" class="section experience-section" aria-labelledby="experience-title">
      <div class="container experience-layout">
        <div class="experience-intro">
          <span class="eyebrow">02 / The experience</span>
          <h2 id="experience-title" tabindex="-1">
            Different domains.<br /><em class="editorial">A consistent craft.</em>
          </h2>
          <p>
            From enterprise workflows to distributed services. A career built through hands-on
            application development.
          </p>
          <span class="career-start">Professional experience since January 2020</span>
        </div>
        <ol class="timeline">
          @for (experience of experiences; track experience.employer) {
            <li>
              <div class="timeline-date">
                <time [attr.datetime]="experience.start">{{ experience.startLabel }}</time>
                <span aria-hidden="true"> - </span><span class="sr-only"> to </span>
                @if (experience.end) {
                  <time [attr.datetime]="experience.end">{{ experience.endLabel }}</time>
                } @else {
                  <span>{{ experience.endLabel }}</span>
                }
              </div>
              <h3>{{ experience.employer }}</h3>
              <p class="role">{{ experience.role }}</p>
              <p class="summary">{{ experience.summary }}</p>
              <ul class="highlights">
                @for (highlight of experience.highlights; track highlight) {
                  <li>{{ highlight }}</li>
                }
              </ul>
              <ul class="tags" aria-label="Selected technologies">
                @for (technology of experience.technologies; track technology) {
                  <li>{{ technology }}</li>
                }
              </ul>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styleUrl: './experience.scss',
})
export class ExperienceSection {
  protected readonly experiences = experiences;
}
