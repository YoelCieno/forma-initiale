import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { FePropertyShimDirective } from './fe-property-shim.directive';
import '@repo/ui/fe-rating';
import '@repo/ui/fe-button';

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

describe('FePropertyShimDirective', () => {
  it('should set readonly JS property on fe-rating (not just attribute)', async () => {
    await TestBed.configureTestingModule({ imports: [HostReadonlyRating] }).compileComponents();
    const fixture = TestBed.createComponent(HostReadonlyRating);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    const el = fixture.nativeElement.querySelector('fe-rating') as HTMLElement & { readonly?: boolean };
    expect((el as unknown as Record<string, unknown>)['readonly']).toBe(true);
  });

  it('should set tabindex JS property on fe-rating', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HostTabindexRating] }).compileComponents();
    const fixture = TestBed.createComponent(HostTabindexRating);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    const el = fixture.nativeElement.querySelector('fe-rating') as HTMLElement & { tabindex?: number };
    expect((el as unknown as Record<string, unknown>)['tabindex']).toBe(5);
  });

  it('should set readonly on fe-button', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [HostReadonlyButton] }).compileComponents();
    const fixture = TestBed.createComponent(HostReadonlyButton);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    const el = fixture.nativeElement.querySelector('fe-button') as HTMLElement & { readonly?: boolean };
    expect((el as unknown as Record<string, unknown>)['readonly']).toBe(true);
  });
});
