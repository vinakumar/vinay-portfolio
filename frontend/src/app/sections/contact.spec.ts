import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clipboard } from '../shared/clipboard';
import { Contact } from './contact';

describe('Contact interactions', () => {
  let fixture: ComponentFixture<Contact>;
  let element: HTMLElement;
  const write = vi.fn<(text: string) => Promise<void>>();

  beforeEach(async () => {
    write.mockReset().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [{ provide: Clipboard, useValue: { write } }],
    }).compileComponents();
    fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('offers an actual email link rather than a pretend form submission', () => {
    expect(element.querySelector('a')?.getAttribute('href')).toBe(
      'mailto:vinaychauhan.22@outlook.com',
    );
    expect(element.querySelector('form')).toBeNull();
    expect(element.textContent).toContain('does not send, collect, or store messages');
  });

  it('announces a copied address only after the clipboard promise succeeds', async () => {
    let complete: () => void = () => undefined;
    const pendingWrite = new Promise<void>((resolve) => {
      complete = resolve;
    });
    write.mockReturnValue(pendingWrite);
    const button = element.querySelector('button') as HTMLButtonElement;
    button.click();
    button.click();
    fixture.detectChanges();
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith('vinaychauhan.22@outlook.com');
    expect(button.disabled).toBe(true);
    expect(element.querySelector('[role="status"]')?.textContent).not.toContain('copied');
    complete();
    await pendingWrite;
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Email address copied.',
    );
  });

  it('offers a usable fallback on denied or unavailable clipboard access', async () => {
    write.mockRejectedValue(new Error('Clipboard unavailable'));
    (element.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Select the address above',
    );
    expect(element.querySelector('[role="status"]')?.textContent).not.toContain(
      'Email address copied.',
    );
    expect(element.querySelector('.email-address')?.getAttribute('href')).toContain('mailto:');
  });

  it('can retry a failed copy without retaining a false success state', async () => {
    write.mockRejectedValueOnce(new Error('Denied'));
    const button = element.querySelector('button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    button.click();
    await fixture.whenStable();
    expect(write).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Email address copied.',
    );
  });
});
