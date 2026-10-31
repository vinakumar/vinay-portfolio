import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { profile, projects } from '../content/portfolio';
import { About } from '../sections/about';
import { Contact } from '../sections/contact';
import { ExperienceSection } from '../sections/experience';
import { Expertise } from '../sections/expertise';
import { Icon } from '../shared/icon';
import { ProjectCard } from '../shared/project-card';
import { Seo } from '../shared/seo';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, ProjectCard, ExperienceSection, Expertise, About, Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly profile = profile;
  protected readonly projects = projects;

  constructor() {
    inject(Seo).update({
      title: 'Vinay Kumar | Senior Software Engineer',
      description: profile.description,
      path: '/',
    });
  }
}
