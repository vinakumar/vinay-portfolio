import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../content/portfolio';
import { Icon } from './icon';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <a
        class="project-card"
        [routerLink]="['/work', project().slug]"
        [attr.aria-labelledby]="'project-' + project().slug"
      >
        <div class="project-art" [attr.data-motif]="project().motif" aria-hidden="true">
          <span class="art-index">{{ project().number }} / {{ project().category }}</span>
          <div class="geometry">
            <span></span><span></span><span></span>
            <span class="geometry-core"></span>
          </div>
          <span class="art-caption">{{ project().employer }}</span>
          <span class="open-project"><app-icon name="arrow-up-right" /></span>
        </div>
        <div class="project-copy">
          <span class="eyebrow">{{ project().category }}</span>
          <h3 [id]="'project-' + project().slug">{{ project().title }}</h3>
          <p>{{ project().summary }}</p>
          <span class="project-action">Explore the work <app-icon name="arrow-right" /></span>
        </div>
      </a>
    </article>
  `,
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
