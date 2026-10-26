import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { genComponentOverridesScript } from './angular'

const dirs: string[] = []

afterAll(() => {
  for (const dir of dirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function makeProject(componentSources: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'gen-overrides-'))
  dirs.push(dir)
  mkdirSync(join(dir, 'scripts'), { recursive: true })
  mkdirSync(join(dir, 'src', 'components'), { recursive: true })
  writeFileSync(join(dir, 'scripts', 'gen-component-overrides.ts'), genComponentOverridesScript)
  for (const [file, content] of Object.entries(componentSources)) {
    writeFileSync(join(dir, 'src', 'components', file), content)
  }
  return dir
}

const run = (cwd: string): { status: number; stdout: string; stderr: string } => {
  try {
    const stdout = execFileSync('bun', ['scripts/gen-component-overrides.ts'], {
      cwd,
      encoding: 'utf8',
    })
    return { status: 0, stdout, stderr: '' }
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string }
    return { status: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' }
  }
}

describe('genComponentOverridesScript', () => {
  it('emits overrides.gen.ts mapping stem keys to classes, with do-not-edit header', () => {
    const dir = makeProject({
      'product-card.component.ts':
        "import { Component } from '@angular/core'\n@Component({ selector: 'fp-product-card', template: '' })\nexport class FpProductCard {}\n",
      'promo-banner.component.ts':
        "import { Component } from '@angular/core'\n@Component({ selector: 'fp-promo-banner', template: '' })\nexport class FpPromoBanner {}\n",
      'noise.ts': 'export const notAComponent = true\n',
      'not-component.txt': 'ignore me\n',
    })

    const result = run(dir)
    expect(result.status).toBe(0)

    const genPath = join(dir, 'src', 'components', 'overrides.gen.ts')
    expect(existsSync(genPath)).toBe(true)
    const gen = readFileSync(genPath, 'utf8')
    expect(gen).toContain('DO NOT EDIT')
    expect(gen).toContain("'product-card': FpProductCard")
    expect(gen).toContain("'promo-banner': FpPromoBanner")
    expect(gen).not.toContain('noise')
  })

  it('fails with non-zero exit naming the file when a .component.ts lacks export class', () => {
    const dir = makeProject({
      'broken.component.ts':
        "import { Component } from '@angular/core'\n@Component({ selector: 'fp-broken', template: '' })\nexport classNotThere {}\n".replace(
          'export classNotThere',
          '// no class export\nconst x = 1',
        ),
    })

    const result = run(dir)
    expect(result.status).not.toBe(0)
    expect(result.stderr + result.stdout).toContain('broken.component.ts')
  })
})
