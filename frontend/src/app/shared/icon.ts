import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'arrow-up'
  | 'mail'
  | 'copy'
  | 'check'
  | 'download'
  | 'menu'
  | 'close'
  | 'code'
  | 'database'
  | 'cloud';

const paths: Record<IconName, string> = {
  'arrow-right': 'M4 12h16M13 5l7 7-7 7',
  'arrow-up-right': 'M5 19 19 5M5 5h14v14',
  'arrow-up': 'M12 20V4M5 11l7-7 7 7',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  copy: 'M9 9h12v12H9zM15 9V3H3v12h6',
  check: 'm4 12 5 5L20 6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  menu: 'M3 7h18M3 17h18',
  close: 'm5 5 14 14M19 5 5 19',
  code: 'm8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18',
  database:
    'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3ZM4 6v12c0 2 3.6 3 8 3s8-1 8-3V6M4 12c0 2 3.6 3 8 3s8-1 8-3',
  cloud: 'M7 18a5 5 0 0 1-1-10 6 6 0 0 1 11-2 6 6 0 0 1 1 12H7Z',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <path [attr.d]="paths[name()]" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 1.25em;
      height: 1.25em;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly paths = paths;
}
