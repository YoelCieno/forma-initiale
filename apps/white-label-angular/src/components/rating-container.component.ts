import '@repo/ui/fe-rating'
import '@repo/ui/fe-card'
import type { FeRatingElement } from '@repo/ui/fe-rating'
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core'
import { FePropertyShimDirective } from './fe-property-shim.directive'

@Component({
  imports: [FePropertyShimDirective],
  selector: 'app-rating-container',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="rating-container">
      <div>
        <h3 class="subheading__h3">Basic</h3>
        <fe-card><fe-rating></fe-rating></fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">With Initial Value</h3>
        <fe-card><fe-rating [value]="3"></fe-rating></fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Readonly</h3>
        <fe-card><fe-rating [value]="4" [readonly]="true"></fe-rating></fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Disabled</h3>
        <fe-card><fe-rating [value]="2" [disabled]="true"></fe-rating></fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Different Max</h3>
        <fe-card><fe-rating [max]="3"></fe-rating></fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Half-Star Precision</h3>
        <fe-card><fe-rating [precision]="0.5" [value]="2.5"></fe-rating></fe-card>
      </div>
      <div class="rating-container__row">
        <h3 class="subheading__h3">Sizes</h3>
        <fe-card>
          <div class="rating-container__row--inline">
            <fe-rating [size]="'xs'" [value]="3"></fe-rating>
            <fe-rating [size]="'s'" [value]="3"></fe-rating>
            <fe-rating [size]="'m'" [value]="3"></fe-rating>
            <fe-rating [size]="'l'" [value]="3"></fe-rating>
            <fe-rating [size]="'xl'" [value]="3"></fe-rating>
          </div>
        </fe-card>
      </div>
    </div>
  `,
  styles: `
    .rating-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10.75rem, 1fr));
      gap: 1.5rem;
    }
    .rating-container__row {
      grid-column: 1 / -1;
    }
    .rating-container__row--inline {
      display: inline;
    }
  `,
})
export class RatingContainer {
  @ViewChild('sampleRating') sampleRating?: ElementRef<FeRatingElement>
}
