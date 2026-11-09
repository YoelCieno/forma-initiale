import type { TenantContext } from '../models'
import { kebabToPascal, pascalToKebab } from '../helpers'
import { fileIo, REPO_ROOT } from '../helpers/file-io'
import { join } from 'node:path'
import { isObject } from '../utils'

const { readFileData, readMirrorFiles } = fileIo()

/** Mirror SoT — (workspace-internal, always in-repo). */
const MIRROR_DIR = 'apps/mirror-tenant-angular'

const packageJson = (ctx: TenantContext): string => {
  const pkgJSON = readFileData<Record<string, unknown>>(join(REPO_ROOT, MIRROR_DIR, 'package.json'))

  return `${JSON.stringify({ ...pkgJSON, name: `${ctx.name}-angular` }, null, 2)}\n`
}

const angularJson = (ctx: TenantContext): string => {
  const name = `${ctx.name}-angular`
  const angularJSONFile = readFileData<Record<string, unknown>>(join(REPO_ROOT, MIRROR_DIR, 'angular.json'))
  const mirrorProjects = isObject(angularJSONFile.projects) ? angularJSONFile.projects : {}
  const mirrorProjectName = Object.keys(mirrorProjects)[0] || ''
  const mirrorProject = mirrorProjectName && isObject(mirrorProjects[mirrorProjectName])
    ? mirrorProjects[mirrorProjectName]
    : {}

  return `${JSON.stringify({
    ...angularJSONFile,
    projects: {
      [name]: {
        ...mirrorProject,
        architect: {
          ...(isObject(mirrorProject.architect) ? mirrorProject.architect : {}),
          serve: {
            builder: '@angular/build:dev-server',
            options: {
              prebundle: false,
              port: ctx.devPort,
            },
            configurations: {
              production: { buildTarget: `${name}:build:production` },
              development: { buildTarget: `${name}:build:development` },
            },
            defaultConfiguration: 'development',
          },
          test: {
            builder: '@angular/build:unit-test',
            options: {
              setupFiles: ['../../packages/infra/src/testing/element-internals.ts'],
            },
          },
        },
      },
    },
  }, null, 2)}\n`
}

const indexHtml = (ctx: TenantContext): string => {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <base href="/" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${ctx.Name} — Tenant</title>
  </head>
  <body>
    <${ctx.appShell ? `${ctx.prefix}-root` : 'app-root'}></${ctx.appShell ? `${ctx.prefix}-root` : 'app-root'}>
  </body>
</html>
`
}

/**
 * Tenant root shell — same shape as fake-plants-angular app.component.ts:
 * inline template + SFC styles, BEM classes prefixed with the tenant prefix.
 * bootstrapApplication uses the selector as the host tag, so index.html
 * must host <prefix-root> (not the shell's <app-root>).
 */
const appComponentTs = (ctx: TenantContext): string => {
  const cls = `${kebabToPascal(ctx.prefix)}App`
  const tag = `${ctx.prefix}-root`
  return `import { Component } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

@Component({
  selector: '${tag}',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: \`
    <nav class="${ctx.prefix}-nav">
      <a
        routerLink="/"
        routerLinkActive="${ctx.prefix}-nav__link--active"
        [routerLinkActiveOptions]="{ exact: true }"
      >Products</a>
    </nav>

    <main class="${ctx.prefix}-main">
      <router-outlet />
    </main>
  \`,
  styles: \`
    .${ctx.prefix}-nav {
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
        &.${ctx.prefix}-nav__link--active {
          color: var(--brand-fill-loud);
          font-weight: 600;
          text-decoration: underline;
        }
      }
    }
    .${ctx.prefix}-main {
      margin: 0 1rem;
    }
  \`,
})
export class ${cls} {}
`
}


const mainTs = (ctx: TenantContext): string => {
  const metaImport =
    ctx.metadataMode === 'fixture'
      ? `import { ${ctx.camelName}Map } from '@repo/infra'\n`
      : ''
  const metaLine =
    ctx.metadataMode === 'fixture'
      ? `  metaMap: ${ctx.camelName}Map,`
      : '  // metaMap: myMap,'
  const appShellImport = ctx.appShell
    ? `import { ${kebabToPascal(ctx.prefix)}App } from './app/app.component'\n`
    : ''
  const appShellLine = `  ${!ctx.appShell ? '//' : ''}appShell: () => import('./app/app.component').then((m) => m.${kebabToPascal(ctx.prefix)}App),`
  
  return `import { bootstrapApplication } from '@angular/platform-browser'
import { createWhiteLabelApp, useWhiteLabelApp } from 'white-label-angular/app'
${metaImport}
import { componentOverrides } from './components/overrides.gen'
import { environment } from './environments/environment'
${appShellImport}
const { setupMocks } = useWhiteLabelApp()

await setupMocks(environment)
const { root, config } = await createWhiteLabelApp({
  env: environment,
${metaLine}

  // filename-key registry: generated from src/components/*.component.ts by pre-hooks
  componentOverrides,
${appShellLine}
})

bootstrapApplication(root, config).catch((err) => console.error(err))
`
}

const environmentTs = (ctx: TenantContext): string => `export const environment = {
  enableMocks: false,
  tenantId: '${ctx.prefix}',
  apiUrl: 'https://api.example.com/api',
}
`

const environmentDevTs = (ctx: TenantContext): string => `export const environment = {
  enableMocks: true,
  tenantId: '${ctx.prefix}',
  apiUrl: 'https://api.example.com/api',
}
`

const overrideComponent = (ctx: TenantContext): string => {
  const stem = pascalToKebab(ctx.overrideComponentName ?? 'Component')
  const cls = `${kebabToPascal(ctx.prefix)}${ctx.overrideComponentName ?? 'Component'}`
  return [
    "import { Component, Input } from '@angular/core'",
    '',
    '@Component({',
    `  selector: '${ctx.prefix}-${stem}',`,
    '  template: `',
    `    <div class="${stem}">`,
    '      <p>{{ title }}</p>',
    '    </div>',
    '  `',
    '})',
    `export class ${cls} {`,
    '  @Input() title?: string',
    '}',
    '',
  ].join('\n')
}

/** Zero-arg SoT readers — apps/mirror-tenant-angular/* (static, no interpolation). */
const {
  'tsconfig.json': tsconfigJson,
  'tsconfig.app.json': tsconfigAppJson,
  'tsconfig.spec.json': tsconfigSpecJson,
  'tsconfig.scripts.json': tsconfigScriptsJson,
  '.eslintrc.cjs': eslintrc,
  '.gitignore': gitignore,
  'src/import-meta-env.d.ts': importMetaEnvDts,
  'src/main.spec.ts': mainSpec,
  'scripts/gen-component-overrides.ts': genComponentOverridesScript,
} = readMirrorFiles(
  [
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.spec.json',
    'tsconfig.scripts.json',
    '.eslintrc.cjs',
    '.gitignore',
    'src/import-meta-env.d.ts',
    'src/main.spec.ts',
    'scripts/gen-component-overrides.ts',
  ],
  MIRROR_DIR,
)

export {
  mainSpec,
  genComponentOverridesScript,
  packageJson,
  angularJson,
  indexHtml,
  appComponentTs,
  mainTs,
  environmentTs,
  environmentDevTs,
  importMetaEnvDts,
  tsconfigJson,
  tsconfigAppJson,
  tsconfigSpecJson,
  tsconfigScriptsJson,
  eslintrc,
  gitignore,
  overrideComponent,
}
