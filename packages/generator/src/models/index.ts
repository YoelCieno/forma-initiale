import { PinionContext } from "@featherscloud/pinion"

export type Theme = 'default' | 'awesome' | 'shoelace' | 'custom'

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
}
