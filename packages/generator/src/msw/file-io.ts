import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs'
import type { TenantConfig } from './add-tenant'

export interface MockedDataConfig {
  [key: string]: TenantConfig
}

export function readMockedData(configPath: string): MockedDataConfig {
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }
  const raw = readFileSync(configPath, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`Invalid JSON in ${configPath}`)
  }
}

export function writeMockedData(configPath: string, data: MockedDataConfig): void {
  writeFileSync(configPath, JSON.stringify(data, null, 2) + '\n')
}

export function copyMswWorker(source: string, target: string): void {
  if (!existsSync(source)) {
    throw new Error(`MSW worker not found: ${source}`)
  }
  if (source === target) return
  const targetDir = target.substring(0, target.lastIndexOf('/'))
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }
  copyFileSync(source, target)
}
