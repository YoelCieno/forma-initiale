import { PinionContext } from '@featherscloud/pinion'
import { TenantConfig } from '../msw/add-tenant'

export type Theme = 'default' | 'cyberpunk' | 'coffeecup' | 'silk' | 'custom'
export type Framework = 'vue' | 'angular' | 'react'

export interface TenantContext extends PinionContext {
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
  devPort: number
  framework: Framework
}

export interface MockedData {
  [key: string]: TenantConfig
}
