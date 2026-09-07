import { Directive, ElementRef, Input, inject } from '@angular/core';

const FE_SELECTOR = 'fe-button, fe-card, fe-rating, fe-img, fe-loader, fe-async-content, fe-icon';

@Directive({
  selector: FE_SELECTOR,
  standalone: true,
})
export class FePropertyShimDirective {
  private el = inject(ElementRef<HTMLElement>);

  @Input()
  set readonly(value: boolean) {
    this.el.nativeElement['readonly'] = value;
  }

  @Input()
  set tabindex(value: number) {
    this.el.nativeElement['tabindex'] = value;
  }
}
