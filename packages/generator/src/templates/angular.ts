import type { TenantContext } from '../models'
import { kebabToPascal, pascalToKebab } from '../helpers'
import { fileIo, REPO_ROOT } from '../helpers/file-io'
import { join } from 'node:path'
import { isObject } from '../utils'

const { readFileData,  } = fileIo()

/** Mirror SoT — (workspace-internal, always in-repo). */
const MIRROR_DIR = 'apps/mirror-tenant-angular'

const packageJson = (ctx: TenantContext): string => {
  const pkgJSON = readFileData<Record<string, unknown>>(join(REPO_ROOT, MIRROR_DIR, 'package.json'))
  // override-barrel hooks + ng script set are tenant-owned (gen script writes
  // src/components/overrides.gen.ts which main.ts imports) — never rely on the
  // mirror SoT carrying them.
  const scripts = {
    ...(isObject(pkgJSON.scripts) ? pkgJSON.scripts : {}),
    dev: 'ng serve',
    build: 'ng build',
    test: 'ng test --watch=false',
    predev: 'bun run scripts/gen-component-overrides.ts',
    prebuild: 'bun run scripts/gen-component-overrides.ts',
    pretest: 'bun run scripts/gen-component-overrides.ts',
  }
  return `${JSON.stringify({ ...pkgJSON, name: `${ctx.name}-angular`, scripts }, null, 2)}\n`
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

${ctx.appShell ? `  // tenant-owned shell: resolves ${kebabToPascal(ctx.prefix)}App from src/app/app.component.ts
  appShell: () => import('./app/app.component').then((m) => m.${kebabToPascal(ctx.prefix)}App),
` : ''}})
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

/** Static — copied verbatim, no interpolation. */
const importMetaEnvDts: string = `// Ambient typing for \`import.meta.env\` — required by @repo/infra mocks helpers
// (\`packages/infra/src/mocks/helpers.ts\` reads \`import.meta.env.MODE\`).
// Vite is not a dependency of this app, so vite/client types are not available.
interface ImportMeta {
  env: {
    MODE?: string
    DEV?: boolean
    PROD?: boolean
    [key: string]: string | boolean | undefined
  }
}
`

/** Static — copied verbatim, no interpolation. */
const tsconfigJson: string = `/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "compileOnSave": false,
  "compilerOptions": {
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  },
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
`

/** Static — copied verbatim, no interpolation. */
const tsconfigAppJson: string = `/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": [],
    "noPropertyAccessFromIndexSignature": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}
`

/** Static — copied verbatim, no interpolation. */
const tsconfigSpecJson: string = `/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.d.ts", "src/**/*.spec.ts", "../../packages/infra/src/testing/element-internals.ts"]
}
`

/** Static — copied verbatim, no interpolation. */
const eslintrc: string = `module.exports = {
  root: true,
  extends: ["@repo/eslint-config/index.js"],
};
`

/** Static — copied verbatim, no interpolation. */
const gitignore: string = `# See https://docs.github.com/get-started/getting-started-with-git/ignoring-files for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/mcp.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings
__screenshots__/

# Generated component override barrel
src/components/overrides.gen.ts

# System files
.DS_Store
Thumbs.db
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

// Pre-hook script: scans src/components/*.component.ts and generates the
// componentOverrides barrel. Rendered to scripts/gen-component-overrides.ts
// and wired via package.json predev/prebuild/pretest hooks.
const genComponentOverridesScript = `// GENERATED by @repo/generator — DO NOT EDIT.
// Regenerates src/components/overrides.gen.ts from src/components/*.component.ts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const componentsDir = join(import.meta.dir, '..', 'src', 'components')
const outFile = join(componentsDir, 'overrides.gen.ts')

const files = readdirSync(componentsDir).filter((f) => f.endsWith('.component.ts'))

const entries: Array<{ key: string; cls: string; file: string }> = []
for (const file of files) {
  const source = readFileSync(join(componentsDir, file), 'utf8')
  const match = source.match(/export class\\s+(\\w+)/)
  if (!match) {
    console.error('gen-component-overrides: ' + file + ' has no export class — cannot map override key')
    process.exit(1)
  }
  entries.push({ key: file.replace(/\\.component\\.ts$/, ''), cls: match[1], file })
}

entries.sort((a, b) => a.key.localeCompare(b.key))

const imports = entries
  .map((e) => 'import { ' + e.cls + " } from './" + e.file.replace(/\\.ts$/, '') + "'")
  .join('\\n')
const map = entries.map((e) => "  '" + e.key + "': " + e.cls + ',').join('\\n')

const header =
  '// GENERATED by gen-component-overrides.ts — DO NOT EDIT.\\n' +
  '// Source: src/components/*.component.ts (filename stem = registry key)\\n'
const body = 'export const componentOverrides = {\\n' + map + '\\n}\\n'

writeFileSync(outFile, imports ? header + imports + '\\n\\n' + body : header + body)
`

const mainSpec: string = `import { describe, expect, it } from 'vitest'
import { createWhiteLabelApp } from 'white-label-angular/app'

describe('createWhiteLabelApp (tenant scaffold)', () => {
  it('returns shell root and config', async () => {
    const { root, config } = await createWhiteLabelApp({})
    expect(root).toBeTruthy()
    expect(config).toBeTruthy()
  })
})
`

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
  eslintrc,
  gitignore,
  overrideComponent,
}
