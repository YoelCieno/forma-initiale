import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs'
import type { MockedData } from '../models'
import { safeJsonParse } from '../utils'


export const readFileData = <T>(configPath: string): T => {
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }
  const raw = readFileSync(configPath, 'utf-8')
  return safeJsonParse<T>(raw, configPath)
}

export const writeMockedData = (configPath: string, data: MockedData): void => {
  writeFileSync(configPath, JSON.stringify(data, null, 2) + '\n')
}

export const copyMswWorker = (source: string, target: string): void => {
  const targetDir = target.substring(0, target.lastIndexOf('/'))
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  copyFileSync(source, target)
}
