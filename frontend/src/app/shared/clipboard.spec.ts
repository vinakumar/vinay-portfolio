import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Clipboard } from './clipboard';

describe('Clipboard capability boundary', () => {
  it('rejects instead of claiming success when the browser API is absent', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: { navigator: {} } } }],
    });
    await expect(TestBed.inject(Clipboard).write('test@example.test')).rejects.toThrow(
      'unavailable',
    );
  });
});
