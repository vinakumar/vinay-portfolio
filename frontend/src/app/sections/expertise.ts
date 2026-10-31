import { ChangeDetectionStrategy, Component } from '@angular/core';
import { skillGroups } from '../content/portfolio';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-expertise',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="expertise" class="section container" aria-labelledby="expertise-title">
      <div class="section-heading">
        <div>
          <span class="eyebrow">03 / The toolkit</span>
          <h2 id="expertise-title" tabindex="-1">Tools with a purpose.</h2>
        </div>
        <p>
          A practical toolkit shaped by backend systems, cloud delivery, and the applications around
          them.
        </p>
      </div>
      <div class="skill-grid">
        @for (group of groups; track group.title; let index = $index) {
          <article>
            <span class="skill-index" aria-hidden="true">0{{ index + 1 }}</span>
            <div>
              <h3>{{ group.title }}</h3>
              <p class="skill-description">{{ group.description }}</p>
              <ul class="skill-list">
                @for (skill of group.skills; track skill) {
                  <li>{{ skill }}</li>
                }
              </ul>
            </div>
          </article>
        }
      </div>
      <aside class="ai-note" aria-labelledby="ai-title">
        <span class="ai-icon" aria-hidden="true"><app-icon name="code" /></span>
        <div>
          <h3 id="ai-title">AI-assisted. Engineering-led.</h3>
          <p>
            Experience with GitHub Copilot, Claude Code, and MCP integrations, alongside the
            fundamentals: code review, testing, and debugging.
          </p>
        </div>
        <span class="eyebrow">Part of the process.<br />Not a replacement for it.</span>
      </aside>
    </section>
  `,
  styleUrl: './expertise.scss',
})
export class Expertise {
  protected readonly groups = skillGroups;
}
