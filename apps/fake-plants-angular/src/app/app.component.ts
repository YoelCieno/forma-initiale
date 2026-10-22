import { Component } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

@Component({
  selector: 'fp-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="fp-nav">
      <a
        routerLink="/"
        routerLinkActive="fp-nav__link--active"
        [routerLinkActiveOptions]="{ exact: true }"
      >Products</a>
      <a routerLink="/about" routerLinkActive="fp-nav__link--active">About</a>
    </nav>

    <main class="fp-main">
      <router-outlet />
    </main>
  `,
  styles: `
    .fp-nav {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 1rem;
      a {
        margin-right: 1rem;
        text-decoration: none;
        color: var(--color-text-body);
        &:hover {
          text-decoration: underline;
        }
        &.fp-nav__link--active {
          color: var(--brand-fill-loud);
          font-weight: 600;
          text-decoration: underline;
        }
      }
    }
    .fp-main {
      margin: 0 1rem;
    }
  `,
})
export class FpApp {}
