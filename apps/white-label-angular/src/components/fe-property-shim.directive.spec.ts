import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { FePropertyShimDirective } from './fe-property-shim.directive';
import '@repo/ui/fe-rating';
import '@repo/ui/fe-button';

// ── WITH directive (positive tests) ──

@Component({
  standalone: true,
  imports: [FePropertyShimDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fe-rating [readonly]="true"></fe-rating>`,
})
class HostReadonlyRating {}

@Component({
  standalone: true,
  imports: [FePropertyShimDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fe-rating [tabindex]="5"></fe-rating>`,
})
class HostTabindexRating {}

@Component({
  standalone: true,
  imports: [FePropertyShimDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fe-button [readonly]="true"></fe-button>`,
})
class HostReadonlyButton {}

// ── WITHOUT directive (bare attrs — negative regression) ──

@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fe-rating size="xs" [value]="3"></fe-rating>`,
})
class HostBareSize {}

@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fe-rating [value]="4" readonly></fe-rating>`,
})
class HostBareReadonly {}

const settle = async (fixture: { whenStable: () => Promise<void> }): Promise<void> => {
  await fixture.whenStable()
  await Promise.resolve()
  await Promise.resolve()
  await new Promise<void>((r) => setTimeout(r, 0))
  await Promise.resolve()
}

describe('FePropertyShimDirective', () => {
  it('should set readonly JS property on fe-rating (not just attribute)', async () => {
    await TestBed.configureTestingModule({ imports: [HostReadonlyRating] }).compileComponents();
    const fixture = TestBed.createComponent(HostReadonlyRating);
    fixture.detectChanges();
    await settle(fixture);
    const el = fixture.nativeElement.querySelector('fe-rating');
    expect(el['readonly']).toBe(true);
  });

  it('should set tabindex JS property on fe-rating', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HostTabindexRating] }).compileComponents();
    const fixture = TestBed.createComponent(HostTabindexRating);
    fixture.detectChanges();
    await settle(fixture);
    const el: Element = fixture.nativeElement.querySelector('fe-rating');
    expect(el['tabindex' as keyof Element]).toBe(5);
  });

  it('should set readonly on fe-button', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HostReadonlyButton] }).compileComponents();
    const fixture = TestBed.createComponent(HostReadonlyButton);
    fixture.detectChanges();
    await settle(fixture);
    const el: Element = fixture.nativeElement.querySelector('fe-button');
    expect(el['readonly' as keyof Element]).toBe(true);
  });
});

describe('bare attrs without directive — regression', () => {
  it('bare size="xs" stays default (Angular only calls setAttribute, hybrids misses it)', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HostBareSize] }).compileComponents();
    const fixture = TestBed.createComponent(HostBareSize);
    fixture.detectChanges();
    await settle(fixture);
    const el: Element = fixture.nativeElement.querySelector('fe-rating');
    // Angular sets HTML attribute but NOT JS property — hybrids reads prop in constructor only
    expect(el['size' as keyof Element]).toBe('m'); // default, NOT 'xs'
  });

  it('bare readonly stays false (Angular mapPropName remaps → hybrids misses it)', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HostBareReadonly] }).compileComponents();
    const fixture = TestBed.createComponent(HostBareReadonly);
    fixture.detectChanges();
    await settle(fixture);
    const el: Element = fixture.nativeElement.querySelector('fe-rating');
    // Angular calls setAttribute('readonly') but hybrids expects lowercase `readonly` property
    expect(el['readonly' as keyof Element]).toBe(false);
  });
});
