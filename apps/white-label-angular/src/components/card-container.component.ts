import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import '@repo/ui/fe-card'
import '@repo/ui/fe-icon'
import { ProductCard } from './product-card.component'

@Component({
  selector: 'app-card-container',
  imports: [ProductCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="card-container">
      <div>
        <h3 class="subheading__h3">Default</h3>
        <fe-card>
          <p>This is a default card. Just body content, no special slots.</p>
        </fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Appearances</h3>
        <div class="card-container__wrapper">
          <fe-card appearance="outlined"><p>Outlined (default)</p></fe-card>
          <fe-card appearance="filled"><p>Filled</p></fe-card>
          <fe-card appearance="accent"><p>Accent</p></fe-card>
        </div>
      </div>

      <div>
        <h3 class="subheading__h3">With Header & Footer</h3>
        <fe-card>
          <h4 slot="header" class="card__h4">Card Title</h4>
          <p>Main content goes here. This card has a header and footer.</p>
          <fe-icon slot="footer" name="star"></fe-icon>
        </fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Horizontal</h3>
        <fe-card orientation="horizontal">
          <p>Horizontal card with side-by-side layout.</p>
          <fe-icon slot="actions" name="gear"></fe-icon>
        </fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Product Card</h3>
        <div class="card-container__wrapper">
          <app-product-card
            id="product-0"
            title="FW Name"
            description="Generic FW"
            image="code"
            imageFamily="classic"
            price="Free"
            previousPrice="$99"
            [rate]="4.5"
          ></app-product-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .card-container {
      display: grid;
      gap: 1.5rem;
    }
    .card-container__wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      flex-direction: column;
    }
  `,
})
export class CardContainer {}
