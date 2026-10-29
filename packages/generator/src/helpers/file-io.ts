import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MockedData } from '../models'
import { safeJsonParse } from '../utils'

/** Repo root — single anchor, module-relative from packages/generator/src/helpers/. */
export const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url))

export interface FileIo {
  readRepoFile: (relPath: string) => string
  readFileData: <T>(configPath: string) => T
  writeFileData: (configPath: string, data: MockedData) => void
  copyMswWorker: (source: string, target: string) => void
  readMirrorFiles: (files: readonly string[], dir: string) => Record<string, () => string>
}

export function fileIo(): FileIo {
  const readRepoFile = (relPath: string): string => {
    const fullPath = join(REPO_ROOT, relPath)
    if (!existsSync(fullPath)) {
      throw new Error(`Repo file not found: ${relPath}`)
    }
    return readFileSync(fullPath, 'utf-8')
  }

  const readFileData = <T>(configPath: string): T => {
    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`)
    }
    const raw = readFileSync(configPath, 'utf-8')
    return safeJsonParse<T>(raw, configPath)
  }

  const writeFileData = (configPath: string, data: MockedData): void => {
    writeFileSync(configPath, JSON.stringify(data, null, 2) + '\n')
  }

  const copyMswWorker = (source: string, target: string): void => {
    const targetDir = target.substring(0, target.lastIndexOf('/'))
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }
    copyFileSync(source, target)
  }

  /** Zero-arg readers for mirror SoT files — keyed by rel path under dir. */
  const readMirrorFiles = (files: readonly string[], dir: string): Record<string, () => string> => {
    const readers: Record<string, () => string> = {}
    files.forEach((rel) => {
      readers[rel] = () => readRepoFile(join(dir, rel))
    })
    return readers
  }

  return { readRepoFile, readFileData, writeFileData, copyMswWorker, readMirrorFiles }
}
