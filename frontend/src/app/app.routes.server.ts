import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { projects } from './content/portfolio';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'work/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => projects.map((project) => ({ slug: project.slug })),
    fallback: PrerenderFallback.None,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
