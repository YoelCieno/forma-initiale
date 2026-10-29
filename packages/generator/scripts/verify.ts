#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import type {
  Framework,
  ProbeChild,
  ProbeDeps,
  ProbeFetchResponse,
  ProbeSpawnOptions,
  TenantContext,
  VerifyDeps,
  VerifyInput,
  VerifyOptions,
  VerifyResult,
} from '../src/models'
import { createMockContext } from '../src/helpers/mocks'
import { options, probing, verification } from '../src/verify'
import { getErrorMessage } from '../src/helpers'

interface Template {
  generate: (ctx: TenantContext) => Promise<TenantContext>
}

/** A repo file the runner may overwrite during a run, with its pre-run content (null = absent). */
interface RepoArtifact {
  path: string
  original: string | undefined
}

const { frameworkList, parse } = options()
const orchestrator = verification()

const notImplemented = (framework: Framework): never => {
  throw new Error(
    `Framework '${framework}' is not implemented yet. Available: ${frameworkList.join(', ')}`,
  )
}

const templates: Record<Framework, () => Promise<Template>> = {
  vue: () => import('../src/generators/vue-tenant.tpl'),
  angular: () => import('../src/generators/angular-tenant.tpl'),
  react: () => notImplemented('react'),
}

const exec = (command: string[], cwd: string): Promise<number> => new Promise((resolve, reject) => {
  const child = spawn(command[0], command.slice(1), { cwd, stdio: 'inherit' })
  child.on('error', reject)
  child.on('close', (code) => resolve(code ?? 1))
})

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const spawnProbeChild = (
  command: string[],
  spawnOptions: ProbeSpawnOptions,
): ProbeChild => {
  const [head, ...args] = command
  const child = spawn(head, args, spawnOptions)
  return {
    stdout: {
      on: (event, listener) => {
        child.stdout?.on(event, listener)
      },
    },
    stderr: {
      on: (event, listener) => {
        child.stderr?.on(event, listener)
      },
    },
    kill: (signal) => {
      child.kill(signal)
    },
    get exitCode(): number | null {
      return child.exitCode
    },
  }
}

const fetchProbePage = async (url: string): Promise<ProbeFetchResponse> => {
  const response = await fetch(url)
  return { ok: response.ok, text: () => response.text() }
}

const probeDeps: ProbeDeps = {
  exists: (path) => existsSync(path),
  readFile: (path) => readFileSync(path, 'utf8'),
  spawn: spawnProbeChild,
  fetchPage: fetchProbePage,
  sleep,
  now: () => Date.now(),
  pollTimeoutMs: 30_000,
  pollIntervalMs: 1_000,
}

const makeDeps = (input: {
  cwd: string
  template: Template
  framework: Framework
  restoreInfra: () => void
}): VerifyDeps => ({
  makeContext: (verifyOptions: VerifyOptions, contextCwd: string): TenantContext =>
    createMockContext<TenantContext>({
      cwd: contextCwd,
      name: 'smoke',
      framework: verifyOptions.framework,
      metadataMode: 'fixture',
      registerMsw: false,
      prefix: 'sm',
    }),
  generate: (ctx) => input.template.generate(ctx),
  exists: (path) => existsSync(path),
  exec,
  run: (appDir, cwd) => probing(probeDeps, input.framework).run(appDir, cwd),
  removeApp: (path) => rmSync(join(input.cwd, path), { recursive: true, force: true }),
  restoreInfra: input.restoreInfra,
})

const snapshotFile = (path: string): RepoArtifact => ({
  path,
  original: existsSync(path) ? readFileSync(path, 'utf8') : undefined,
})

const restoreFile = ({ path, original }: RepoArtifact): void => {
  if (!original) {
    rmSync(path, { force: true })
    return
  }
  writeFileSync(path, original)
}

// restoreInfra writes back every repo artifact a run touches:
// packages/infra/src/index.ts, packages/infra/src/metadata/smoke.ts, bun.lock
const snapshotInfra = (cwd: string): (() => void) => {
  const artifacts = [
    join(cwd, 'packages/infra/src/index.ts'),
    join(cwd, 'packages/infra/src/metadata/smoke.ts'),
    join(cwd, 'bun.lock'),
  ].map(snapshotFile)

  return () => artifacts.forEach(restoreFile)
}

const main = async (): Promise<VerifyResult> => {
  const cwd = process.cwd()
  if (!existsSync(join(cwd, 'packages/generator'))) {
    throw new Error(`Run from the repo root — packages/generator not found under ${cwd}`)
  }
  const verifyOptions = parse(process.argv.slice(2))
  const template = await templates[verifyOptions.framework]()
  const input: VerifyInput = {
    options: verifyOptions,
    cwd,
    deps: makeDeps({
      cwd,
      template,
      framework: verifyOptions.framework,
      restoreInfra: snapshotInfra(cwd),
    }),
    log: (message) => console.log(message),
  }
  return orchestrator.run(input)
}

main()
  .then((result) => {
    console.log(orchestrator.summary(result))
    process.exit(result.ok ? 0 : 1)
  })
  .catch((error: unknown) => {
    console.error(getErrorMessage(error))
    process.exit(1)
  })
