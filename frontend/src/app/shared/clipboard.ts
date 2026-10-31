import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Clipboard {
  private readonly document = inject(DOCUMENT);

  async write(text: string): Promise<void> {
    const clipboard = this.document.defaultView?.navigator.clipboard;
    if (!clipboard?.writeText) {
      throw new Error('Clipboard access is unavailable.');
    }
    await clipboard.writeText(text);
  }
}
