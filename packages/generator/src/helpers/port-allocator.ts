import { readdirSync, readFileSync, existsSync, type Dirent } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_FIRST_PORT = Number(process.env.DEFAULT_FIRST_PORT) || 3100

const readAppsDir = (cwd: string): Dirent[] => {
  try {
    return readdirSync(join(cwd, 'apps'), { withFileTypes: true })
  } catch {
    return []
  }
}

const isVueTenantDir = (entry: Dirent): boolean =>
  entry.isDirectory() && entry.name.endsWith('-vue')

const extractDevPort = (configPath: string): number | undefined => {
  if (!existsSync(configPath)) return undefined

  const content = readFileSync(configPath, 'utf-8')
  const match = content.match(/devPort:\s*(\d+)/)

  return match ? Number.parseInt(match[1], 10) : undefined
}

/** Scans apps/*-vue/vite.config.ts for devPort values and returns max+1 */
export const findNextDevPort = (cwd: string): number => {
  const ports = readAppsDir(cwd)
    .filter(isVueTenantDir)
    .map((entry) => extractDevPort(join(cwd, 'apps', entry.name, 'vite.config.ts')))
    .filter((p): p is number => !!p)

  return ports.length > 0 ? Math.max(...ports) + 1 : DEFAULT_FIRST_PORT
}
