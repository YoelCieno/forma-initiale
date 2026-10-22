import type { Framework, TenantContext } from './main'

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
export const OVERLAY_DETAIL = 'vite-error-overlay present in page'
export const PASS_DETAIL = 'dev server responded with id="app"'
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
  requiredTenantFiles: string[]
  run: (input: VerifyInput) => Promise<VerifyResult>
  summary: (result: VerifyResult) => string
}
