import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import '@repo/ui/fe-card'

@Component({
  selector: 'app-about-page',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="about-page">
      <h1 class="about-page__title">About Fake Plants</h1>
      <fe-card class="about-page__card">
        <p>
          Fake Plants is a demo tenant app built on top of the
          <strong>forma-initiale</strong> white-label platform.
        </p>
        <p>
          This page demonstrates how tenant apps can add new pages
          that don't exist in the white-label base.
        </p>
      </fe-card>
    </div>
  `,
  styles: `
    .about-page {
      max-width: 75rem;
      margin: 1.2rem auto 0;
      padding: 0 1rem;
    }
    .about-page__title {
      font-size: var(--fs-xl);
    }
  `,
})
export class AboutPage {}
