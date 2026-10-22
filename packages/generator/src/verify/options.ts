import type { Framework } from '../models/main'
import type { Options, VerifyOptions } from '../models/verify'

const FRAMEWORK_FLAG = '--framework'
const PROBE_FLAG = '--probe'
const KEEP_FLAG = '--keep'

/** A single argv token match: how many tokens it consumed + the options patch it applies. */
interface TokenMatch {
  consumed: number
  patch: Partial<VerifyOptions>
}

type TokenReader = (token: string, argv: string[], index: number) => TokenMatch | undefined

export function options(): Options {
  const frameworkList: Framework[] = ['vue', 'angular', 'react']

  const isFramework = (value: string): value is Framework =>
    frameworkList.some((framework) => framework === value)

  const readProbe: TokenReader = (token) =>
    token === PROBE_FLAG ? { consumed: 1, patch: { probe: true } } : undefined

  const readKeep: TokenReader = (token) =>
    token === KEEP_FLAG ? { consumed: 1, patch: { keep: true } } : undefined

  const readFramework: TokenReader = (token, argv, index) => {
    if (token !== FRAMEWORK_FLAG && !token.startsWith(`${FRAMEWORK_FLAG}=`)) {
      return undefined
    }
    const inline = token.slice(FRAMEWORK_FLAG.length)
    const value = inline.startsWith('=') ? inline.slice(1) : argv[index + 1]
    const consumed = inline.startsWith('=') ? 1 : 2
    if (value === undefined || !isFramework(value)) {
      throw new Error(
        `Unknown framework: ${String(value)}. Valid frameworks: ${frameworkList.join(', ')}`,
      )
    }
    return { consumed, patch: { framework: value } }
  }

  // New flag = append one reader; parse stays unchanged.
  const readers: TokenReader[] = [readProbe, readKeep, readFramework]

  const parse = (argv: string[]): VerifyOptions => {
    let current: VerifyOptions = { framework: 'vue', probe: false, keep: false }
    let index = 0

    while (index < argv.length) {
      const token = argv[index]
      const match = readers.reduce<TokenMatch | undefined>(
        (found, reader) => found ?? reader(token, argv, index),
        undefined,
      )
      if (match === undefined) {
        throw new Error(`Unknown option: ${token}`)
      }
      current = { ...current, ...match.patch }
      index += match.consumed
    }

    return current
  }

  const tenantName = ({ framework }: VerifyOptions): string => `smoke-${framework}`

  return { frameworkList, isFramework, parse, tenantName }
}
