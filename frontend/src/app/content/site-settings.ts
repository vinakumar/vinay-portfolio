import { InjectionToken } from '@angular/core';
import settings from './site-settings.json';

export interface PublicResume {
  readonly assetPath: string;
  readonly downloadName: string;
  readonly publicUseApproved: boolean;
}

export interface SiteSettings {
  readonly productionUrl: string | null;
  readonly publicContentApproved: boolean;
  readonly indexingEnabled: boolean;
  readonly resume: PublicResume | null;
}

export const SITE_SETTINGS = new InjectionToken<SiteSettings>('Public site settings', {
  providedIn: 'root',
  factory: () => settings,
});
