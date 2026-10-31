import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { findProject, projects } from '../content/portfolio';
import { Icon } from '../shared/icon';
import { Seo } from '../shared/seo';
import { NotFound } from './not-found';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Icon, NotFound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly seo = inject(Seo);
  protected readonly project = computed(() => findProject(this.params().get('slug')));
  protected readonly nextProject = computed(() => {
    const current = this.project();
    return current ? projects[(projects.indexOf(current) + 1) % projects.length] : undefined;
  });

  constructor() {
    effect(() => {
      const current = this.project();
      if (current) {
        this.seo.update({
          title: `${current.title} | Vinay Kumar`,
          description: current.summary,
          path: `/work/${current.slug}`,
        });
      }
    });
  }
}
