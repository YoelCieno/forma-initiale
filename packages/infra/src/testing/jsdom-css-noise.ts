/**
 * jsdom CSS parse noise suppressor for Angular test runs — dual-role module.
 *
 * jsdom's CSS parser rejects modern CSS (nesting, `:host`, WA token styles)
 * emitted by hybrids `.css`` templates + WA themes. It logs one
 * "Could not parse CSS stylesheet" `console.error` per style element per
 * render — dozens of lines per suite. jsdom ignores those styles anyway, so
 * the output is pure noise.
 *
 * Two consumers point at the SAME file:
 * - `setupFiles` (workers): importing this module applies the console filter
 *   as a side effect (self-installing at the bottom).
 * - `runnerConfig` (main process): vitest loads the default-exported config,
 *   which carries the inline `Reporter` class. Self-install in
 *   the main process is harmless (idempotent wrap).
 *
 * Two consoles must be wrapped: vitest's jsdom env `populateGlobal`s the
 * window console onto `globalThis` (test-code path), while jsdom's
 * `virtualConsole.forwardTo()` captured the Node console object earlier
 * (internal jsdomError path). Patching only one leaves the other noisy.
 *
 * Drops are counted in a run-scoped temp file (`jsdom-css-noise-<ppid>.counts`,
 * one `1` per drop); the reporter prints ONE aggregate summary per run from
 * the main process. A `process.on('exit')` hook cannot be used: vitest forks
 * pool kills workers, which never fires exit handlers.
 *
 * Function-factory pattern: 2+ fns per module → `export function` outer,
 * inner arrows, consumers destructure from `jsdomCssNoise()`.
 */

// shortcut: filter still hides WHICH styles failed — only an aggregate count
//  is reported. cssstyle 6.2.0 already shipped; upstream fix is the CSS
//  nesting support tracked in https://github.com/jsdom/jsdom/issues/4132.
//  Revisit per-line visibility if real CSS errors need debugging.

import { appendFileSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import nodeConsole from 'node:console'
import type { ViteUserConfig } from 'vitest/config'

const NOISE_MATCH = 'Could not parse CSS stylesheet'

export function jsdomCssNoise() {
  const WRAPPED = Symbol.for('repo.jsdom-css-noise.wrapped')

  const countFile = (): string =>
    path.join(os.tmpdir(), `jsdom-css-noise-${process.ppid}.counts`)

  // Identity-based guard per console target: spy frameworks (vi.spyOn) copy own
  // props from the wrapped fn onto the spy, so a WRAPPED property on
  // console.error alone would false-positive and skip re-wrapping the spy.
  const lastWrapper = new WeakMap<object, (...args: unknown[]) => void>()

  const recordDrop = (): void => {
    try {
      // One write per drop — sync append, negligible on tmpfs. Reporter reads
      // this after the run; no debounce = no race with worker kill.
      appendFileSync(countFile(), '1\n')
    } catch {
      // Count file is best-effort; suppression itself must never throw.
    }
  }

  const wrapConsole = (target: object): void => {
    // D6 — idempotency: never stack wrappers (module side effect + explicit call).
    if (Reflect.get(target, 'error') === lastWrapper.get(target)) return

    const original = Reflect.get(target, 'error') as (...args: unknown[]) => void
    const wrapper = (...args: unknown[]): void => {
      if (typeof args[0] === 'string' && args[0].includes(NOISE_MATCH)) {
        recordDrop()
        return
      }
      original(...args)
    }
    Reflect.set(wrapper, WRAPPED, true)
    lastWrapper.set(target, wrapper)
    Reflect.set(target, 'error', wrapper)
  }

  const suppress = (): void => {
    wrapConsole(console)
    wrapConsole(nodeConsole)
  }

  /** Test-only: remove the run-scoped count file between specs. */
  const resetCount = (): void => {
    try {
      rmSync(countFile(), { force: true })
    } catch {
      // best effort
    }
  }

  /**
   * Prints ONE aggregate summary of suppressed jsdom CSS parse failures per
   * test run. Runs in the main process (workers are killed by the forks pool,
   * so their exit handlers never fire). Workers write to `process.ppid` —
   * the main process — so the reporter reads `process.pid` here.
   */
  const Reporter = class {
    onTestRunEnd(): void {
      const file = path.join(os.tmpdir(), `jsdom-css-noise-${process.pid}.counts`)
      try {
        const raw = readFileSync(file, 'utf8')
        const count = raw.split('\n').filter((line) => line === '1').length
        if (count > 0) {
          console.error(
            `[jsdom] suppressed ${count} CSS parse failures (${NOISE_MATCH})`
          )
        }
      } catch {
        // No count file — nothing was dropped, nothing to report.
      } finally {
        rmSync(file, { force: true })
      }
    }
  }

  return { suppress, resetCount, Reporter }
}

const noise = jsdomCssNoise()

// Vitest 4 resolves inline reporter instances given via `runnerConfig`; the
// string form would need a resolvable file path, which consolidation removed.
const config = {
  test: {
    reporters: ['default', new noise.Reporter()],
  },
} satisfies ViteUserConfig

export default config

// Self-installing entry: setupFiles import applies the filter with zero app code.
noise.suppress()
