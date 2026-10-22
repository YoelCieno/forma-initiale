import { join } from 'node:path'
import {
  CONSOLE_ERROR_PATTERN,
  CONSOLE_LINE_CAP,
  DEV_PORT_PATTERN,
  NO_DEV_PORT_DETAIL,
  OVERLAY_DETAIL,
  PASS_DETAIL,
  TEARDOWN_TERM_MS,
} from '../models/verify'
import type {
  PageReply,
  Probe,
  ProbeChild,
  ProbeDeps,
  ProbeResult,
} from '../models/verify'
import { getErrorMessage } from '../helpers'

/**
 * Contract for probing(deps).run(appDir, cwd):
 * - devPort parsed from `<cwd>/<appDir>/vite.config.ts` via `/devPort:\s*(\d+)/`.
 * - Polls the dev server until pass/fail/deadline, then scans accumulated
 *   stdout+stderr against `/(error|unhandled|failed)/i` on BOTH paths.
 * - Teardown (SIGTERM → sleep → SIGKILL if alive) runs on every spawned path.
 * - Never rejects: spawn/fetch failures resolve as `{ ok: false, detail }`.
 * All I/O goes through injected deps — no node:fs / node:child_process here.
 * Constants and types (ProbeDeps, ProbeChild, etc.) live in ../models/verify.
 */
export function probing(deps: ProbeDeps): Probe {
  const readDevPort = (configPath: string): number | undefined => {
    if (!deps.exists(configPath)) return undefined

    const match = deps.readFile(configPath).match(DEV_PORT_PATTERN)
    return match ? Number.parseInt(match[1], 10) : undefined
  }

  /** fetchPage that never rejects — connection errors become a non-ok reply. */
  const fetchPage = async (port: number): Promise<PageReply> => {
    try {
      const response = await deps.fetchPage(`http://localhost:${port}/`)
      if (!response.ok) return { ok: false, body: '' }
      return { ok: true, body: await response.text() }
    } catch {
      return { ok: false, body: '' }
    }
  }

  const pollUntilReady = async (port: number): Promise<ProbeResult> => {
    const deadline = deps.now() + deps.pollTimeoutMs
    while (deps.now() < deadline) {
      await deps.sleep(deps.pollIntervalMs)
      const page = await fetchPage(port)
      if (!page.ok) continue
      if (!page.body.includes('id="app"')) continue
      if (page.body.includes('vite-error-overlay')) {
        return { ok: false, detail: OVERLAY_DETAIL }
      }
      return { ok: true, detail: PASS_DETAIL }
    }
    return { ok: false, detail: `dev server did not respond within ${deps.pollTimeoutMs}ms` }
  }

  /** First 3 error-matching lines: trimmed, deduped, capped. */
  const matchedConsoleLines = (output: string): string[] => {
    const matched = output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => CONSOLE_ERROR_PATTERN.test(line))
    return Array.from(new Set(matched)).slice(0, CONSOLE_LINE_CAP)
  }

  /** Applies console scan on both pass and fail paths. */
  const applyConsoleScan = (result: ProbeResult, output: string): ProbeResult => {
    const lines = matchedConsoleLines(output)
    if (lines.length === 0) return result

    const joined = lines.join('; ')
    if (result.ok) {
      return { ok: false, detail: `console errors: ${joined}` }
    }
    return { ok: false, detail: `${result.detail}; console: ${joined}` }
  }

  /** Best-effort teardown — never fails the probe on kill errors. */
  const stopServer = async (child: ProbeChild): Promise<void> => {
    try {
      child.kill('SIGTERM')
      await deps.sleep(TEARDOWN_TERM_MS)
      if (child.exitCode === null) child.kill('SIGKILL')
    } catch {
      // teardown is best-effort
    }
  }

  const run = async (appDir: string, cwd: string): Promise<ProbeResult> => {
    const appPath = join(cwd, appDir)
    let child: ProbeChild | undefined
    let output = ''
    try {
      const port = readDevPort(join(appPath, 'vite.config.ts'))
      if (port === undefined) {
        return { ok: false, detail: NO_DEV_PORT_DETAIL }
      }

      child = deps.spawn(['bun', 'run', 'dev'], {
        cwd: appPath,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      const accumulate = (chunk: Buffer | string): void => {
        output += `${chunk}\n`
      }
      child.stdout.on('data', accumulate)
      child.stderr.on('data', accumulate)

      return applyConsoleScan(await pollUntilReady(port), output)
    } catch (error) {
      return applyConsoleScan({ ok: false, detail: getErrorMessage(error) }, output)
    } finally {
      if (child) await stopServer(child)
    }
  }

  return { run }
}
