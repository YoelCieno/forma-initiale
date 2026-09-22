import { tmpdir } from 'node:os'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import type { VueTenantContext } from '../models'

export const tmpDirs: string[] = []

export function createMockContext<T>(
  overrides: Partial<VueTenantContext> = {},
): T {
  const tmpDir = mkdtempSync(join(tmpdir(), 'gen-test-'))
  tmpDirs.push(tmpDir)
  return {
    name: 'test',
    Name: 'Test',
    camelName: 'test',
    description: 'Test tenant',
    metadataMode: 'fixture',
    theme: 'default',
    brandHex: undefined,
    overrideComponent: false,
    overrideComponentName: undefined,
    registerMsw: false,
    prefix: 'te',
    cwd: tmpDir,
    argv: [],
    pinion: {
      cwd: tmpDir,
      force: true,
      logger: {
        notice: () => {},
        warn: () => {},
        error: () => {},
        log: () => {},
      },
      prompt: (() => Promise.resolve({})),
      trace: [],
      exec: async () => 0,
    },
    ...overrides,
  } as T
}
