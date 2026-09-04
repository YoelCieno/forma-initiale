import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ButtonContainer } from '../components/button-container.component'
import { CardContainer } from '../components/card-container.component'
import { IconContainer } from '../components/icon-container.component'
import { RatingContainer } from '../components/rating-container.component'

@Component({
  selector: 'app-components-page',
  imports: [ButtonContainer, IconContainer, RatingContainer, CardContainer],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="components-page">
      <section class="components-page__section">
        <h2 class="components-page__heading">Button</h2>
        <app-button-container />

        <section class="components-page__subsection">
          <h2 class="components-page__heading">Icon</h2>
          <app-icon-container />
        </section>
        <section class="components-page__subsection">
          <h2 class="components-page__heading">Rating</h2>
          <app-rating-container />
        </section>
      </section>

      <section class="components-page__section">
        <h2 class="components-page__heading">Card</h2>
        <app-card-container />
      </section>
    </div>
  `,
  styles: `
    .components-page {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(28rem, 1fr));
      column-gap: 2.25rem;
      max-width: 75rem;
      margin: 0 auto;
      padding: 1rem 1rem 1.75rem;
    }
    .components-page__section {
      margin-bottom: 1.5rem;
    }
    .components-page__subsection {
      margin-top: 2rem;
    }
    .components-page__heading {
      margin-bottom: 0.75rem;
      font-size: var(--fs-l);
    }
  `,
})
export class ComponentsPage {}
