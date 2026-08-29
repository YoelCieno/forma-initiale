import '@repo/ui/fe-icon'
import '@repo/ui/fe-card'
import type { FeIconElement } from '@repo/ui/fe-icon'
import { ElementRef, ViewChild } from '@angular/core'
import { feComponent } from '../factories/create-custom-elements'

@feComponent({
  selector: 'app-icon-container',
  template: `
    <div class="icon-container">
      <div>
        <h3 class="subheading__h3">Basic Icons</h3>
        <fe-card>
          <div class="icon-container__row">
            <fe-icon name="check"></fe-icon>
            <fe-icon name="star"></fe-icon>
            <fe-icon name="heart"></fe-icon>
            <fe-icon name="rocket"></fe-icon>
            <fe-icon name="gear"></fe-icon>
          </div>
        </fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Animations</h3>
        <fe-card>
          <div class="icon-container__row">
            <fe-icon name="star" animation="spin"></fe-icon>
            <fe-icon name="star" animation="pulse"></fe-icon>
            <fe-icon name="star" animation="bounce"></fe-icon>
          </div>
        </fe-card>
      </div>

      <div>
        <h3 class="subheading__h3">Sizes</h3>
        <fe-card>
          <div class="icon-container__row">
            <fe-icon name="rocket" style="font-size: var(--fs-xs)"></fe-icon>
            <fe-icon name="rocket" style="font-size: var(--fs-s)"></fe-icon>
            <fe-icon name="rocket" style="font-size: var(--fs-m)"></fe-icon>
            <fe-icon name="rocket" style="font-size: var(--fs-l)"></fe-icon>
            <fe-icon name="rocket" style="font-size: var(--fs-xl)"></fe-icon>
          </div>
        </fe-card>
      </div>
    </div>
  `,
  styles: `
    .icon-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: 1.5rem;
    }
    .icon-container__row {
      display: flex;
      align-items: center;
      height: 1.5rem;
    }
  `,
})
export class IconContainer {
  @ViewChild('sampleIcon') sampleIcon?: ElementRef<FeIconElement>
}
