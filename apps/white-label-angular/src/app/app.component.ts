import { Component } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="wl-nav">
      <a
        routerLink="/"
        routerLinkActive="wl-nav__link--active"
        [routerLinkActiveOptions]="{ exact: true }"
      >Products</a>
      <a routerLink="/components" routerLinkActive="wl-nav__link--active">Components</a>
    </nav>

    <main class="wl-main">
      <router-outlet />
    </main>
  `,
  styles: `
    .wl-nav {
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
        &.wl-nav__link--active {
          color: var(--brand-fill-loud);
          font-weight: 600;
          text-decoration: underline;
        }
      }
    }
    .wl-main {
      margin: 0 1rem;
    }
  `,
})
export class App {}
