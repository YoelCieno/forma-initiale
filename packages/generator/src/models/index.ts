import { PinionContext } from "@featherscloud/pinion"

export type Theme = 'default' | 'cyberpunk' | 'coffeecup' | 'silk' | 'custom'

export interface VueTenantContext extends PinionContext {
  name: string
  Name: string
  camelName: string
  description: string
  metadataMode: 'fixture' | 'none'
  theme: Theme
  brandHex?: string
  overrideComponent: boolean
  overrideComponentName?: string
  registerMsw?: boolean
  prefix: string
}
