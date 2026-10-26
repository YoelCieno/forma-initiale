import { readdirSync, readFileSync, existsSync, type Dirent } from 'node:fs'
import { join } from 'node:path'
import { DEV_PORT_PATTERN, type AngularJson, type Framework, type PortScan } from '../models'
import { isNumber, isObject } from '../utils'

/** vite.config.ts — unstructured TS source, regex is the only option. */
const vitePort = (content: string): number | undefined => {
  const match = content.match(DEV_PORT_PATTERN)
  return match ? Number.parseInt(match[1], 10) : undefined
}

/** angular.json — valid JSON, parse structurally. */
const angularPort = (content: string): number | undefined => {
  try {
    // boundary: JSON.parse returns any — annotated with the parsed shape
    const parsed: AngularJson = JSON.parse(content)
    if (!isObject(parsed)) return undefined

    const ports = Object.values(parsed.projects ?? {})
      .map((project) => project.serve?.options?.port)
      .filter(isNumber)

    return ports.length > 0 ? Math.max(...ports) : undefined
  } catch {
    return undefined
  }
}

/** Fallback first ports — each overridable via `${FRAMEWORK}_FIRST_PORT` (VUE_FIRST_PORT, …). */
const portScans = {
  vue: { dirSuffix: '-vue', configFile: 'vite.config.ts', extract: vitePort, fallbackPort: 3000 },
  angular: { dirSuffix: '-angular', configFile: 'angular.json', extract: angularPort, fallbackPort: 3200 },
  // react shell is Vite-based; no -react apps exist yet → fallbackPort only
  react: { dirSuffix: '-react', configFile: 'vite.config.ts', extract: vitePort, fallbackPort: 3300 },
} satisfies Record<Framework, PortScan>

/** Read lazily (not at import) so callers/tests can set env after module load. */
const readFirstPort = (framework: Framework, fallbackPort: number): number =>
  Number(process.env[`${framework.toUpperCase()}_FIRST_PORT`]) || fallbackPort

const readAppsDir = (cwd: string): Dirent[] => {
  try {
    return readdirSync(join(cwd, 'apps'), { withFileTypes: true })
  } catch {
    return []
  }
}

const matchesSuffix = (entry: Dirent, suffix: string): boolean =>
  entry.isDirectory() && entry.name.endsWith(suffix)

const readPort = (
  configPath: string,
  extract: (content: string) => number | undefined,
): number | undefined => {
  if (!existsSync(configPath)) return undefined

  return extract(readFileSync(configPath, 'utf-8'))
}

/** Scans apps/*{suffix}/{configFile} for dev ports, returns max+1 or `${FRAMEWORK}_FIRST_PORT`/fallback. */
export const findNextDevPort = (cwd: string, framework: Framework): number => {
  const scan = portScans[framework]
  const ports = readAppsDir(cwd)
    .filter((entry) => matchesSuffix(entry, scan.dirSuffix))
    .map((entry) => readPort(join(cwd, 'apps', entry.name, scan.configFile), scan.extract))
    .filter(isNumber)

  if (ports.length > 0) return Math.max(...ports) + 1

  return readFirstPort(framework, scan.fallbackPort)
}
