import { join } from 'node:path'
import { options } from './options'
import type {
  Orchestrator,
  StepResult,
  VerifyDeps,
  VerifyInput,
  VerifyOptions,
  VerifyResult,
} from '../models/verify'

/** One planned step: the log line shown before it runs and the action producing its result. */
interface PlannedStep {
  message: string
  run: () => Promise<StepResult>
}

/** Everything the step builders and the plan need — bundled to keep params ≤3. */
interface PlanContext {
  verifyOptions: VerifyOptions
  cwd: string
  deps: VerifyDeps
  appDir: string
}

const REQUIRED_TENANT_FILES = [
  'package.json',
  'vite.config.ts',
  'src/main.ts',
  'vitest.setup.ts',
  '.eslintrc.cjs',
]

/**
 * Runs a plan in order, stopping at the first failing step.
 * Immutable accumulation — no push, no per-step exit-code checks.
 */
const execute = async (
  plan: PlannedStep[],
  log: (message: string) => void,
): Promise<VerifyResult> => {
  let result: VerifyResult = { ok: true, steps: [] }
  for (const { message, run } of plan) {
    if (!result.ok) break
    log(message)
    const step = await run()
    result = { ok: step.ok, steps: [...result.steps, step] }
  }
  return result
}

export function verification(): Orchestrator {
  const requiredTenantFiles = REQUIRED_TENANT_FILES

  const turboCommand = (
    task: 'build' | 'test',
    tenantName: string,
  ): string[] => ['bun', 'x', 'turbo', 'run', task, `--filter=${tenantName}`]

  const generateStep = async (context: PlanContext): Promise<StepResult> => {
    const ctx = context.deps.makeContext(context.verifyOptions, context.cwd)
    await context.deps.generate(ctx)
    return { name: 'generate', ok: true, detail: `generated ${context.appDir}` }
  }

  const filesStep = async (context: PlanContext): Promise<StepResult> => {
    const missing = requiredTenantFiles.filter(
      (file) => !context.deps.exists(join(context.cwd, context.appDir, file)),
    )
    const hasMissingFiles = missing.length > 0

    return {
      name: 'files',
      ok: !hasMissingFiles,
      detail: hasMissingFiles ? `${missing.join(', ')}` : 'all required files present'
    }
  }

  const execStep = async (
    context: PlanContext,
    name: string,
    command: string[],
  ): Promise<StepResult> => {
    const code = await context.deps.exec(command, context.cwd)
    return { name, ok: code === 0, detail: `exit ${code}` }
  }

  const probeStep = async (context: PlanContext): Promise<StepResult> => {
    const { ok, detail } = await context.deps.run(context.appDir, context.cwd)
    return { name: 'probe', ok, detail }
  }

  const makePlan = (context: PlanContext): PlannedStep[] => {
    const { verifyOptions, appDir } = context
    const tenantName = options().tenantName(verifyOptions)
    const buildCommand = turboCommand('build', tenantName)
    const testCommand = turboCommand('test', tenantName)
    return [
      {
        message: `▶ generate — scaffolding ${appDir}`,
        run: () => generateStep(context),
      },
      {
        message: `▶ files — checking ${requiredTenantFiles.length} required files`,
        run: () => filesStep(context),
      },
      {
        message: '▶ install — bun install',
        run: () => execStep(context, 'install', ['bun', 'install']),
      },
      {
        message: `▶ build — ${buildCommand.join(' ')}`,
        run: () => execStep(context, 'build', buildCommand),
      },
      {
        message: `▶ test — ${testCommand.join(' ')}`,
        run: () => execStep(context, 'test', testCommand),
      },
      ...(verifyOptions.probe
        ? [
            {
              message: `▶ probe — checking ${appDir} dev server`,
              run: () => probeStep(context),
            },
          ]
        : []),
    ]
  }

  const run = async (input: VerifyInput): Promise<VerifyResult> => {
    const { options: verifyOptions, cwd, deps, log } = input
    const appDir = `apps/${options().tenantName(verifyOptions)}`
    try {
      const plan = makePlan({ verifyOptions, cwd, deps, appDir })
      return await execute(plan, log)
    } finally {
      if (!verifyOptions.keep) {
        deps.removeApp(appDir)
        deps.restoreInfra()
      }
    }
  }

  const summary = ({ steps, ok }: VerifyResult): string => {
    const summaryResult = steps.map((step) => `${step.ok ? '[ok]' : '[fail]'} ${step.name}: ${step.detail}`)
    
    return [...summaryResult, ok ? 'PASS' : 'FAIL'].join('\n')
  }

  return { requiredTenantFiles, run, summary }
}
