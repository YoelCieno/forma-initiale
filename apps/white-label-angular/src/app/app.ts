import { Component } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styles: `
    nav {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 1rem;
    }
    nav a {
      margin-right: 1rem;
      text-decoration: none;
      color: var(--color-text-body);
    }
    nav a:hover {
      text-decoration: underline;
    }
    nav a.nav-link--active {
      color: var(--brand-fill-loud);
      font-weight: 600;
      text-decoration: underline;
    }
    main {
      margin: 0 1rem;
    }
  `,
})
export class App {}
