import { describe, it, expect } from 'vitest'
import type { ProbeChild, ProbeDeps } from '../models/verify'
import { probing } from './probe'

/**
 * Contract spec for probing(deps).run(appDir, cwd).
 *
 * - devPort is parsed from `<cwd>/<appDir>/vite.config.ts` via `/devPort:\s*(\d+)/`.
 * - Console scan pattern (documented choice): `/(error|unhandled|failed)/i`,
 *   applied to accumulated stdout+stderr lines on BOTH pass and fail paths.
 *   - pass flips to `console errors: <first 3 matched lines, joined by '; ', trimmed, deduped>`
 *   - already-failing appends `; console: <lines>` to the original detail
 * - Teardown on every spawned path (try/finally): SIGTERM → sleep(500) → SIGKILL if still alive.
 * - Spawn 'error' events are out of scope for ProbeChild — a spawn that dies silently
 *   surfaces as empty output + the timeout result. A spawn that throws must NOT reject.
 */

const REPO_ROOT = '/repo'
const APP_DIR = 'apps/smoke-vue'
const CONFIG_PATH = `${REPO_ROOT}/${APP_DIR}/vite.config.ts`
const APP_BODY = '<div id="app"></div>'
const PASS_DETAIL = 'dev server responded with id="app"'
const NO_PORT_DETAIL = 'no devPort found in vite.config.ts'
const OVERLAY_DETAIL = 'vite-error-overlay present in page'
const timeoutDetail = (ms: number): string => `dev server did not respond within ${ms}ms`

interface FetchReply {
  ok: boolean
  body?: string
  throws?: boolean
}

interface HarnessConfig {
  exists?: boolean
  config?: string
  replies?: FetchReply[]
  stdout?: string[]
  stderr?: string[]
  /** exitCode after SIGTERM (null = still alive → SIGKILL expected). */
  exitAfterTerm?: number | null
  spawnThrows?: boolean
  pollTimeoutMs?: number
  pollIntervalMs?: number
}

interface Harness {
  deps: ProbeDeps
  run: (appDir: string, cwd: string) => Promise<{ ok: boolean; detail: string }>
  spawnCalls: Array<{ command: string[]; options: { cwd: string; stdio: string[] } }>
  fetchUrls: string[]
  sleepMs: number[]
  readFilePaths: string[]
  kills: NodeJS.Signals[]
  stdoutSubs: Array<(chunk: Buffer | string) => void>
  stderrSubs: Array<(chunk: Buffer | string) => void>
}

function makeHarness(config: HarnessConfig = {}): Harness {
  const replies: FetchReply[] =
    config.replies && config.replies.length > 0
      ? [...config.replies]
      : [{ ok: true, body: APP_BODY }]
  const spawnCalls: Harness['spawnCalls'] = []
  const fetchUrls: string[] = []
  const sleepMs: number[] = []
  const readFilePaths: string[] = []
  const kills: NodeJS.Signals[] = []
  const stdoutSubs: Harness['stdoutSubs'] = []
  const stderrSubs: Harness['stderrSubs'] = []
  let queuedStdout: string[] = [...(config.stdout ?? [])]
  let queuedStderr: string[] = [...(config.stderr ?? [])]
  let exitCode: number | null = null
  let clock = 0

  const flush = (): void => {
    queuedStdout.forEach((line) => stdoutSubs.forEach((emit) => emit(line)))
    queuedStderr.forEach((line) => stderrSubs.forEach((emit) => emit(line)))
    queuedStdout = []
    queuedStderr = []
  }

  const child: ProbeChild = {
    stdout: {
      on: (_event, cb) => {
        stdoutSubs.push(cb)
      },
    },
    stderr: {
      on: (_event, cb) => {
        stderrSubs.push(cb)
      },
    },
    kill: (signal) => {
      kills.push(signal)
      if (signal === 'SIGTERM') exitCode = config.exitAfterTerm === undefined ? 0 : config.exitAfterTerm
    },
    get exitCode(): number | null {
      return exitCode
    },
  }

  const deps: ProbeDeps = {
    exists: () => config.exists ?? true,
    readFile: (path: string): string => {
      readFilePaths.push(path)
      return config.config ?? `export default { server: { devPort: 3999 } }`
    },
    spawn: (command, options) => {
      if (config.spawnThrows) throw new Error('spawn ENOENT')
      spawnCalls.push({ command, options })
      return child
    },
    fetchPage: (url) => {
      fetchUrls.push(url)
      const reply = replies.length > 1 ? replies.shift()! : replies[0]
      if (reply.throws) return Promise.reject(new Error('fetch failed'))
      return Promise.resolve({ ok: reply.ok, text: async () => reply.body ?? '' })
    },
    sleep: (ms) => {
      sleepMs.push(ms)
      flush()
      clock += ms
      return Promise.resolve()
    },
    now: () => clock,
    pollTimeoutMs: config.pollTimeoutMs ?? 3000,
    pollIntervalMs: config.pollIntervalMs ?? 1000,
  }

  return {
    deps,
    run: probing(deps).run,
    spawnCalls,
    fetchUrls,
    sleepMs,
    readFilePaths,
    kills,
    stdoutSubs,
    stderrSubs,
  }
}

describe('probe — devPort detection', () => {
  it('fails without spawning when vite.config.ts is missing', async () => {
    const harness = makeHarness({ exists: false })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: false, detail: NO_PORT_DETAIL })
    expect(harness.spawnCalls).toHaveLength(0)
  })

  it('fails without spawning when the config has no devPort', async () => {
    const harness = makeHarness({ config: 'export default { server: { port: 3000 } }' })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: false, detail: NO_PORT_DETAIL })
    expect(harness.spawnCalls).toHaveLength(0)
  })

  it('reads vite.config.ts from the app dir and polls the parsed devPort', async () => {
    const harness = makeHarness({ config: 'export default { server: { devPort: 3100 } }' })

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.readFilePaths).toEqual([CONFIG_PATH])
    expect(harness.fetchUrls[0]).toBe('http://localhost:3100/')
  })
})

describe('probe — spawn setup', () => {
  it('spawns `bun run dev` in the app dir with piped stdio', async () => {
    const harness = makeHarness()

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.spawnCalls).toEqual([
      {
        command: ['bun', 'run', 'dev'],
        options: { cwd: `${REPO_ROOT}/${APP_DIR}`, stdio: ['ignore', 'pipe', 'pipe'] },
      },
    ])
  })

  it('subscribes to both stdout and stderr', async () => {
    const harness = makeHarness()

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.stdoutSubs).toHaveLength(1)
    expect(harness.stderrSubs).toHaveLength(1)
  })
})

describe('probe — page polling', () => {
  it('passes when the page responds with id="app"', async () => {
    const harness = makeHarness({ replies: [{ ok: true, body: APP_BODY }] })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: true, detail: PASS_DETAIL })
  })

  it('keeps polling while the response is not ok', async () => {
    const harness = makeHarness({
      replies: [{ ok: false }, { ok: true, body: APP_BODY }],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: true, detail: PASS_DETAIL })
    expect(harness.fetchUrls).toHaveLength(2)
  })

  it('keeps polling while the body has no id="app"', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: '<div></div>' }, { ok: true, body: APP_BODY }],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: true, detail: PASS_DETAIL })
    expect(harness.fetchUrls).toHaveLength(2)
  })

  it('keeps polling when fetch rejects', async () => {
    const harness = makeHarness({
      replies: [{ ok: false, throws: true }, { ok: true, body: APP_BODY }],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: true, detail: PASS_DETAIL })
    expect(harness.fetchUrls).toHaveLength(2)
  })

  it('fails immediately on vite-error-overlay in the page', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: `${APP_BODY}<vite-error-overlay></vite-error-overlay>` }],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: false, detail: OVERLAY_DETAIL })
    expect(harness.fetchUrls).toHaveLength(1)
  })

  it('checks id="app" before the overlay', async () => {
    const harness = makeHarness({
      replies: [
        { ok: true, body: '<vite-error-overlay open></vite-error-overlay>' },
        { ok: true, body: APP_BODY },
      ],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: true, detail: PASS_DETAIL })
    expect(harness.fetchUrls).toHaveLength(2)
  })

  it('times out with the configured poll timeout when the server never responds', async () => {
    const harness = makeHarness({ replies: [{ ok: false }], pollTimeoutMs: 3000 })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: false, detail: timeoutDetail(3000) })
    expect(harness.fetchUrls.length).toBeGreaterThan(0)
  })
})

describe('probe — console output scan', () => {
  it('flips a passing probe to failed when stdout matches the error pattern, capped at 3 lines', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: APP_BODY }],
      stdout: [
        'Unhandled rejection: boom',
        '  error in foo.ts',
        'failed to load bar',
        'error: fourth line',
        'error: fifth line',
      ],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({
      ok: false,
      detail:
        'console errors: Unhandled rejection: boom; error in foo.ts; failed to load bar',
    })
  })

  it('flips on stderr matches too', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: APP_BODY }],
      stderr: ['Unhandled rejection: async init'],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({
      ok: false,
      detail: 'console errors: Unhandled rejection: async init',
    })
  })

  it('trims and dedupes matched lines before joining', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: APP_BODY }],
      stdout: ['  error: one', 'error: one', 'error: two'],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({
      ok: false,
      detail: 'console errors: error: one; error: two',
    })
  })

  it('leaves a passing result untouched when no line matches', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: APP_BODY }],
      stdout: ['ready in 123ms'],
      stderr: ['listening on 3999'],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: true, detail: PASS_DETAIL })
  })

  it('appends console lines to the timeout detail', async () => {
    const harness = makeHarness({
      replies: [{ ok: false }],
      pollTimeoutMs: 3000,
      stdout: ['failed: bind EADDRINUSE'],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({
      ok: false,
      detail: `${timeoutDetail(3000)}; console: failed: bind EADDRINUSE`,
    })
  })

  it('appends console lines to the overlay detail', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: `${APP_BODY}<vite-error-overlay></vite-error-overlay>` }],
      stderr: ['error: transform failed'],
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({
      ok: false,
      detail: `${OVERLAY_DETAIL}; console: error: transform failed`,
    })
  })
})

describe('probe — teardown', () => {
  it('SIGTERMs the dev server after a passing probe without escalating', async () => {
    const harness = makeHarness({ exitAfterTerm: 0 })

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.kills).toEqual(['SIGTERM'])
    expect(harness.sleepMs).toContain(500)
  })

  it('escalates to SIGKILL when the server survives SIGTERM', async () => {
    const harness = makeHarness({ exitAfterTerm: null })

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.kills).toEqual(['SIGTERM', 'SIGKILL'])
  })

  it('tears the server down on the timeout path', async () => {
    const harness = makeHarness({
      replies: [{ ok: false }],
      pollTimeoutMs: 3000,
      exitAfterTerm: 0,
    })

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.kills).toEqual(['SIGTERM'])
  })

  it('tears the server down on the overlay failure path', async () => {
    const harness = makeHarness({
      replies: [{ ok: true, body: `${APP_BODY}<vite-error-overlay></vite-error-overlay>` }],
      exitAfterTerm: 0,
    })

    await harness.run(APP_DIR, REPO_ROOT)

    expect(harness.kills).toEqual(['SIGTERM'])
  })
})

describe('probe — resilience', () => {
  it('resolves a failure result instead of throwing when spawn throws', async () => {
    const harness = makeHarness({ spawnThrows: true })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result.ok).toBe(false)
    expect(typeof result.detail).toBe('string')
    expect(result.detail.length).toBeGreaterThan(0)
  })

  it('resolves a timeout result instead of rejecting when fetch always throws', async () => {
    const harness = makeHarness({
      replies: [{ ok: false, throws: true }],
      pollTimeoutMs: 3000,
    })

    const result = await harness.run(APP_DIR, REPO_ROOT)

    expect(result).toEqual({ ok: false, detail: timeoutDetail(3000) })
  })
})
