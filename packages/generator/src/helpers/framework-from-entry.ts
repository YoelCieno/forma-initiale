import { Framework } from '../models'

const FRAMEWORK_MATCHERS: ReadonlyArray<
  readonly [Framework, (path: string) => boolean]
> = [
  ['angular', (p) => p.includes('angular-tenant.tpl')],
  ['vue', (p) => p.includes('vue-tenant.tpl')],
  // react: matcher only — no white-label-react shell yet
  ['react', (p) => p.includes('react-tenant.tpl')],
]

export const inferFramework = (entryPath: string): Framework => {
  const fw = FRAMEWORK_MATCHERS.find(([, matches]) => matches(entryPath))

  if (!fw) throw new Error(`Cannot infer framework from: ${entryPath}`)
  return fw[0]
}
