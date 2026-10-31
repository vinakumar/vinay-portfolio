import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Navigation disclosure', () => {
  let fixture: ComponentFixture<Header>;
  let button: HTMLButtonElement;
  let navigation: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    button = element.querySelector('button') as HTMLButtonElement;
    navigation = element.querySelector('nav') as HTMLElement;
  });

  it('keeps disclosure state and the accessible control relationship synchronized', () => {
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(navigation.id);
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.classList.contains('is-open')).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the menu trigger', () => {
    // jsdom does not evaluate viewport media queries; model the visible mobile trigger.
    button.style.display = 'inline-flex';
    button.click();
    fixture.detectChanges();
    navigation.querySelector('a')?.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });
});
