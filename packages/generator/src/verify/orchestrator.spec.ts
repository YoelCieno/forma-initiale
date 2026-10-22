import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { getConfig } from '@featherscloud/pinion'
import type { Framework, TenantContext } from '../models/main'
import type {
  Orchestrator,
  ProbeResult,
  StepResult,
  VerifyDeps,
  VerifyInput,
  VerifyOptions,
  VerifyResult,
} from '../models/verify'
import { verification } from './orchestrator'

const REPO_ROOT = '/repo'
const APP_DIR = 'apps/smoke-vue'
const INSTALL_CMD = ['bun', 'install']
const BUILD_CMD = ['bun', 'x', 'turbo', 'run', 'build', '--filter=smoke-vue']
const TEST_CMD = ['bun', 'x', 'turbo', 'run', 'test', '--filter=smoke-vue']
// Deliberately distinct from the orchestrator's old hardcoded detail so the
// pass-through assertion is a real contract test, not a string coincidence.
const PROBE_OK_DETAIL = 'dev server responded with id="app" (port 3999)'
const PROBE_FAIL_DETAIL = 'console errors: Unhandled rejection'

function makeCtx(framework: Framework = 'vue'): TenantContext {
  return {
    name: `smoke-${framework}`,
    Name: `Smoke${framework}`,
    camelName: `smoke${framework}`,
    description: 'smoke tenant',
    metadataMode: 'fixture',
    theme: 'default',
    overrideComponent: false,
    registerMsw: false,
    prefix: 'sm',
    devPort: 3999,
    framework,
    cwd: REPO_ROOT,
    argv: [],
    pinion: getConfig({ cwd: REPO_ROOT }),
  }
}

function makeDeps(
  ctx: TenantContext = makeCtx(),
  overrides: Partial<VerifyDeps> = {},
): VerifyDeps {
  const base: VerifyDeps = {
    makeContext: vi.fn(() => ctx),
    generate: vi.fn(async (generated: TenantContext) => generated),
    exists: vi.fn(() => true),
    exec: vi.fn(async () => 0),
    run: vi.fn(async (): Promise<ProbeResult> => ({
      ok: true,
      detail: PROBE_OK_DETAIL,
    })),
    removeApp: vi.fn(),
    restoreInfra: vi.fn(),
  }
  return { ...base, ...overrides }
}

function buildInput(
  verifyOptions: VerifyOptions,
  deps: VerifyDeps,
): { input: VerifyInput; log: Mock } {
  const log: Mock = vi.fn()
  return {
    input: { options: verifyOptions, cwd: REPO_ROOT, deps, log },
    log,
  }
}

const stepNames = (result: VerifyResult): string[] =>
  result.steps.map((step: StepResult) => step.name)

const stepFor = (result: VerifyResult, name: string): StepResult | undefined =>
  result.steps.find((step: StepResult) => step.name === name)

const vueOptions: VerifyOptions = {
  framework: 'vue',
  probe: false,
  keep: false,
}

describe('requiredTenantFiles', () => {
  it('lists the files a generated tenant must contain', () => {
    expect(verification().requiredTenantFiles).toEqual([
      'package.json',
      'vite.config.ts',
      'src/main.ts',
      'vitest.setup.ts',
      '.eslintrc.cjs',
    ])
  })
})

describe('run — happy path', () => {
  let orchestrator: Orchestrator

  beforeEach(() => {
    orchestrator = verification()
  })

  it('generates the tenant exactly once with the context from makeContext', async () => {
    const ctx: TenantContext = makeCtx('vue')
    const deps: VerifyDeps = makeDeps(ctx)
    const { input } = buildInput(vueOptions, deps)

    await orchestrator.run(input)

    expect(deps.generate).toHaveBeenCalledTimes(1)
    expect(deps.generate).toHaveBeenCalledWith(ctx)
  })

  it('runs install then build then test for the smoke tenant in the repo root', async () => {
    const deps: VerifyDeps = makeDeps()
    const { input } = buildInput(vueOptions, deps)

    await orchestrator.run(input)

    expect(deps.exec).toHaveBeenNthCalledWith(1, INSTALL_CMD, REPO_ROOT)
    expect(deps.exec).toHaveBeenNthCalledWith(2, BUILD_CMD, REPO_ROOT)
    expect(deps.exec).toHaveBeenNthCalledWith(3, TEST_CMD, REPO_ROOT)
  })

  it('reports the steps in order without a probe step', async () => {
    const deps: VerifyDeps = makeDeps()
    const { input } = buildInput(vueOptions, deps)

    const result = await orchestrator.run(input)

    expect(result.ok).toBe(true)
    expect(stepNames(result)).toEqual([
      'generate',
      'files',
      'install',
      'build',
      'test',
    ])
  })

  it('marks every step ok with a non-empty detail', async () => {
    const deps: VerifyDeps = makeDeps()
    const { input } = buildInput(vueOptions, deps)

    const result = await orchestrator.run(input)

    expect(result.steps).toHaveLength(5)
    for (const step of result.steps) {
      expect(step.ok).toBe(true)
      expect(typeof step.detail).toBe('string')
      expect(step.detail.length).toBeGreaterThan(0)
    }
  })

  it('logs progress output', async () => {
    const deps: VerifyDeps = makeDeps()
    const { input, log } = buildInput(vueOptions, deps)

    await orchestrator.run(input)

    expect(log).toHaveBeenCalled()
  })
})

describe('run — probe step', () => {
  let orchestrator: Orchestrator

  beforeEach(() => {
    orchestrator = verification()
  })

  it('appends a probe step when probe is enabled and passes the probe detail through', async () => {
    const deps: VerifyDeps = makeDeps()
    const { input } = buildInput(
      { framework: 'vue', probe: true, keep: false },
      deps,
    )

    const result = await orchestrator.run(input)

    expect(stepNames(result)).toEqual([
      'generate',
      'files',
      'install',
      'build',
      'test',
      'probe',
    ])
    expect(deps.run).toHaveBeenCalledWith(APP_DIR, REPO_ROOT)
    expect(stepFor(result, 'probe')?.ok).toBe(true)
    expect(stepFor(result, 'probe')?.detail).toBe(PROBE_OK_DETAIL)
    expect(result.ok).toBe(true)
  })

  it('fails the run and propagates the probe failure detail verbatim', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      run: vi.fn(async (): Promise<ProbeResult> => ({
        ok: false,
        detail: PROBE_FAIL_DETAIL,
      })),
    })
    const { input } = buildInput(
      { framework: 'vue', probe: true, keep: false },
      deps,
    )

    const result = await orchestrator.run(input)

    expect(result.ok).toBe(false)
    expect(stepFor(result, 'probe')?.ok).toBe(false)
    expect(stepFor(result, 'probe')?.detail).toBe(PROBE_FAIL_DETAIL)
  })
})

describe('run — failure paths', () => {
  let orchestrator: Orchestrator

  beforeEach(() => {
    orchestrator = verification()
  })

  it('stops after a failing build and skips the test step', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      exec: vi.fn(async (command: string[]) =>
        command.includes('build') ? 1 : 0,
      ),
    })
    const { input } = buildInput(vueOptions, deps)

    const result = await orchestrator.run(input)

    expect(result.ok).toBe(false)
    expect(stepFor(result, 'build')?.ok).toBe(false)
    expect(stepFor(result, 'test')).toBeUndefined()
    expect(deps.exec).toHaveBeenCalledTimes(2)
  })

  it('stops after a failing install and skips build and test', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      exec: vi.fn(async (command: string[]) =>
        command[1] === 'install' ? 1 : 0,
      ),
    })
    const { input } = buildInput(vueOptions, deps)

    const result = await orchestrator.run(input)

    expect(result.ok).toBe(false)
    expect(stepFor(result, 'install')?.ok).toBe(false)
    expect(stepFor(result, 'build')).toBeUndefined()
    expect(stepFor(result, 'test')).toBeUndefined()
    expect(deps.removeApp).toHaveBeenCalledWith(APP_DIR)
    expect(deps.restoreInfra).toHaveBeenCalledTimes(1)
  })

  it('fails the files step and never executes when a required file is missing', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      exists: vi.fn(() => false),
    })
    const { input } = buildInput(vueOptions, deps)

    const result = await orchestrator.run(input)

    expect(result.ok).toBe(false)
    const files: StepResult | undefined = stepFor(result, 'files')
    expect(files?.ok).toBe(false)
    expect(files?.detail).toContain('package.json')
    expect(files?.detail).toContain('src/main.ts')
    expect(deps.exec).not.toHaveBeenCalled()
  })

  it('rejects the run when generate rejects', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      generate: vi.fn(async () => {
        throw new Error('generate boom')
      }),
    })
    const { input } = buildInput(vueOptions, deps)

    await expect(orchestrator.run(input)).rejects.toThrow('generate boom')
  })
})

describe('run — cleanup', () => {
  let orchestrator: Orchestrator

  beforeEach(() => {
    orchestrator = verification()
  })

  it('removes the app and restores infra on success', async () => {
    const deps: VerifyDeps = makeDeps()
    const { input } = buildInput(vueOptions, deps)

    await orchestrator.run(input)

    expect(deps.removeApp).toHaveBeenCalledWith(APP_DIR)
    expect(deps.restoreInfra).toHaveBeenCalledTimes(1)
  })

  it('removes the app and restores infra after a build failure', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      exec: vi.fn(async (command: string[]) =>
        command.includes('build') ? 1 : 0,
      ),
    })
    const { input } = buildInput(vueOptions, deps)

    await orchestrator.run(input)

    expect(deps.removeApp).toHaveBeenCalledWith(APP_DIR)
    expect(deps.restoreInfra).toHaveBeenCalledTimes(1)
  })

  it('skips cleanup when keep is enabled, even on failure', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      exec: vi.fn(async () => 1),
    })
    const { input } = buildInput(
      { framework: 'vue', probe: false, keep: true },
      deps,
    )

    await orchestrator.run(input)

    expect(deps.removeApp).not.toHaveBeenCalled()
    expect(deps.restoreInfra).not.toHaveBeenCalled()
  })

  it('removes the app and restores infra when generate rejects', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      generate: vi.fn(async () => {
        throw new Error('generate boom')
      }),
    })
    const { input } = buildInput(vueOptions, deps)

    await expect(orchestrator.run(input)).rejects.toThrow('generate boom')

    expect(deps.removeApp).toHaveBeenCalledWith(APP_DIR)
    expect(deps.restoreInfra).toHaveBeenCalledTimes(1)
  })

  it('skips cleanup when generate rejects and keep is enabled', async () => {
    const deps: VerifyDeps = makeDeps(makeCtx(), {
      generate: vi.fn(async () => {
        throw new Error('generate boom')
      }),
    })
    const { input } = buildInput(
      { framework: 'vue', probe: false, keep: true },
      deps,
    )

    await expect(orchestrator.run(input)).rejects.toThrow('generate boom')

    expect(deps.removeApp).not.toHaveBeenCalled()
    expect(deps.restoreInfra).not.toHaveBeenCalled()
  })
})

describe('summary', () => {
  let orchestrator: Orchestrator

  beforeEach(() => {
    orchestrator = verification()
  })

  it('lists every step name and reports PASS when the run is ok', () => {
    const result: VerifyResult = {
      ok: true,
      steps: [
        { name: 'generate', ok: true, detail: 'ok' },
        { name: 'files', ok: true, detail: 'all present' },
        { name: 'build', ok: true, detail: 'exit 0' },
        { name: 'test', ok: true, detail: 'exit 0' },
      ],
    }

    const summary: string = orchestrator.summary(result)

    expect(summary).toMatch(/PASS/)
    for (const step of result.steps) {
      expect(summary).toContain(step.name)
    }
  })

  it('lists every step name and reports FAIL when the run failed', () => {
    const result: VerifyResult = {
      ok: false,
      steps: [
        { name: 'generate', ok: true, detail: 'ok' },
        { name: 'files', ok: true, detail: 'all present' },
        { name: 'build', ok: false, detail: 'exit 1' },
      ],
    }

    const summary: string = orchestrator.summary(result)

    expect(summary).toMatch(/FAIL/)
    for (const step of result.steps) {
      expect(summary).toContain(step.name)
    }
  })
})
