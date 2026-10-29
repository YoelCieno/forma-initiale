import type { Framework, TenantContext } from './main'
import type { AngularJson } from './ports'
import { isNumber, isObject } from '../utils'

export interface VerifyOptions {
  framework: Framework
  probe: boolean
  keep: boolean
}

export interface Options {
  frameworkList: Framework[]
  isFramework: (value: string) => value is Framework
  parse: (argv: string[]) => VerifyOptions
  tenantName: (options: VerifyOptions) => string
}

export interface StepResult {
  name: string
  ok: boolean
  detail: string
}

export interface VerifyResult {
  ok: boolean
  steps: StepResult[]
}

export interface ProbeResult {
  ok: boolean
  detail: string
}

export const DEV_PORT_PATTERN = /devPort:\s*(\d+)/
export const CONSOLE_ERROR_PATTERN = /(error|unhandled|failed)/i
export const NO_DEV_PORT_DETAIL = 'no devPort found in vite.config.ts'
export const ANGULAR_NO_DEV_PORT_DETAIL = 'no serve port found in angular.json'
export const OVERLAY_DETAIL = 'vite-error-overlay present in page'
export const PASS_DETAIL = 'dev server responded with id="app"'
export const ANGULAR_PASS_DETAIL = 'dev server responded with <app-root'
export const APP_MARKER = 'id="app"'
export const APP_ROOT_MARKER = '<app-root'
export const CONSOLE_LINE_CAP = 3
export const TEARDOWN_TERM_MS = 500

export interface PageReply {
  ok: boolean
  body: string
}

export interface ProbeStream {
  on: (event: string, listener: (chunk: Buffer | string) => void) => void
}

export interface ProbeChild {
  stdout: ProbeStream
  stderr: ProbeStream
  kill: (signal: NodeJS.Signals) => void
  readonly exitCode: number | null
}

export interface ProbeSpawnOptions {
  cwd: string
  stdio: Array<'ignore' | 'pipe'>
}

export interface ProbeFetchResponse {
  ok: boolean
  text: () => Promise<string>
}

export interface ProbeDeps {
  exists: (path: string) => boolean
  readFile: (path: string) => string
  spawn: (command: string[], options: ProbeSpawnOptions) => ProbeChild
  fetchPage: (url: string) => Promise<ProbeFetchResponse>
  sleep: (ms: number) => Promise<void>
  now: () => number
  pollTimeoutMs: number
  pollIntervalMs: number
}

export interface Probe {
  /** Framework selects the dev-port source (vite.config.ts vs angular.json) and app marker. */
  run: (appDir: string, cwd: string) => Promise<ProbeResult>
}

export interface VerifyDeps {
  makeContext: (options: VerifyOptions, cwd: string) => TenantContext
  generate: (ctx: TenantContext) => Promise<TenantContext>
  exists: (path: string) => boolean
  exec: (command: string[], cwd: string) => Promise<number>
  run: (appDir: string, cwd: string) => Promise<ProbeResult>
  removeApp: (path: string) => void
  restoreInfra: () => void
}

export interface VerifyInput {
  options: VerifyOptions
  cwd: string
  deps: VerifyDeps
  log: (message: string) => void
}

export interface Orchestrator {
  requiredTenantFiles: (framework: Framework) => string[]
  run: (input: VerifyInput) => Promise<VerifyResult>
  summary: (result: VerifyResult) => string
}

/** vite.config.ts — unstructured TS source, regex is the only option. */
export const vitePort = (content: string): number | undefined => {
  const match = content.match(DEV_PORT_PATTERN)
  return match ? Number.parseInt(match[1], 10) : undefined
}

/** angular.json — valid JSON, parse structurally. Shared with verify probe. */
export const angularPort = (content: string): number | undefined => {
  try {
    // boundary: JSON.parse returns any — annotated with the parsed shape
    const parsed: AngularJson = JSON.parse(content)
    if (!isObject(parsed)) return undefined

    const ports = Object.values(parsed.projects ?? {})
      .map((project) => project.architect?.serve?.options?.port)
      .filter(isNumber)

    return ports.length > 0 ? Math.max(...ports) : undefined
  } catch {
    return undefined
  }
}

/** Everything the probe needs to know about one framework's dev server shape. */
export interface ProbeTarget {
  configFile: string
  extractPort: (content: string) => number | undefined
  appMarker: string
  passDetail: string
  noPortDetail: string
}

const viteTarget: ProbeTarget = {
  configFile: 'vite.config.ts',
  extractPort: vitePort,
  appMarker: APP_MARKER,
  passDetail: PASS_DETAIL,
  noPortDetail: NO_DEV_PORT_DETAIL,
}

const angularTarget: ProbeTarget = {
  configFile: 'angular.json',
  extractPort: angularPort,
  appMarker: APP_ROOT_MARKER,
  passDetail: ANGULAR_PASS_DETAIL,
  noPortDetail: ANGULAR_NO_DEV_PORT_DETAIL,
}

export const PROBE_TARGETS: Record<Framework, ProbeTarget> = {
  vue: viteTarget,
  angular: angularTarget,
  react: viteTarget,
}
