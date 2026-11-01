# Design decisions

## Reference research

The primary reference was the README of [developer-portfolios](https://github.com/emmabostian/developer-portfolios), revision `fa83a75e4b1d21ef681c9ed4d3467e91f635dca5`. These three entries were then fetched directly on 31 October 2026:

| Reference                                                     | Observed content and interaction structure                                                                            | Useful idea                                                                                | Boundary                                                                                                                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Brittany Chiang](https://brittanychiang.com)                 | Clearly separated about, dated experience, selected projects, technologies, and writing.                              | Put evidence and responsibilities ahead of visual spectacle; make experience easy to scan. | No copied layout, wording, assets, or source code.                                                                                                             |
| [Lee Robinson](https://leerob.io), redirected to `leerob.com` | Concise biography, notes, and dated writing; direct, text-led navigation.                                             | Strong editorial hierarchy and succinct, human professional copy.                          | Vinay has not supplied articles; do not invent a writing section.                                                                                              |
| [Bruno Simon](https://bruno-simon.com)                        | Describes an explorable 3D world, keyboard/touch/gamepad controls, quality/audio options, and implementation credits. | A memorable visual idea should relate to the developer's work.                             | Only the fetched text/control descriptions were inspected, not the interactive 3D rendering. A game interface is unsuitable for this recruiter's reading task. |

The research establishes content and interaction patterns, not a claim that reference screenshots or all interactive states were visually tested. No external portfolio code, branding, photography, illustrations, or personal facts are reused.

## Three original directions considered

| Direction                  | Professionalism/readability                                                                | Originality                                                                               | Responsive/accessibility cost                                                        | Suitability                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Dark systems console       | Strong technical association, but dense text risks looking like developer tooling.         | Moderate; terminal motifs are common.                                                     | Dark contrast and small code-like type require care.                                 | Rejected: fake code-window decoration does not help evaluate the actual work.           |
| Minimal monochrome resume  | Excellent scanability and small payload.                                                   | Low unless typography is especially distinctive.                                          | Lowest complexity across viewports.                                                  | Useful restraint, but insufficient differentiation alone.                               |
| **Engineering fieldnotes** | Editorial hierarchy, evidence-led projects, readable timelines, and clear contact actions. | Asymmetric typography, an original connected-practice motif, and numbered work summaries. | Fluid grids become a single reading column; no essential animated or canvas content. | **Selected:** the engineering work is the focus, with a distinctive but quiet identity. |

## Selected visual system

- Warm paper background, dark ink/teal typography, sage surfaces, and one bright citron accent.
- Large, deliberate headings; DM Sans for interface/body copy; IBM Plex Mono only for small indices and metadata. Fonts are self-hosted and licensed under SIL OFL 1.1.
- An original abstract engineering-practice illustration connects API, data, and cloud interests. It is explicitly not a diagram of an employer's system.
- Restrained borders, squared-off rounded corners, generous but useful whitespace, and consistent arrow/icon treatment.
- Four professional-work summaries, not fictional side projects. Project detail pages are high-level contribution records, not invented architectural case studies.
- Single intentionally designed light theme with dark feature surfaces. No theme switcher: it would double presentation states without a user requirement.
- Subtle entrance/hover motion only; reduced-motion preferences disable nonessential movement. Content never waits for an animation or intersection event to become readable.
- Mobile navigation is a nonmodal disclosure, not a dialog. Native links, visible focus, Escape-to-close, and sensible focus return preserve keyboard behavior.
- The approved PDF download appears in the hero for quick recruiter access and again in About beside the background details. Both use the same native download component and visible PDF label; existing work/experience actions remain, and the header is not crowded with another menu item.

## Deliberate omissions

- No portrait was supplied: no fabricated avatar or stock portrait.
- No public employer-project repositories were supplied: no fake source/demo buttons. The separately confirmed portfolio repository does not establish source availability for professional projects.
- No quantified hero statistics, availability status, endorsements, proficiency scores, or live activity.
- The resume's client names and numerical performance claims are omitted from public project copy pending permission and measurement context.
- PDF distribution was initially withheld. After explicit owner approval, the original is now a real download rather than an email request; the email fallback is retained for a future build that intentionally removes the public PDF.
- No external trackers, contact database, paid integration, or cosmetic backend.
