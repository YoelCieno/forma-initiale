#!/usr/bin/env bun
/**
 * register-msw-tenant.ts — CLI to add a tenant config entry to MSW mock data.
 *
 * Usage:
 *   bun scripts/register-msw-tenant.ts --prefix <key> --names-json '["name1","name2"]'
 *
 * Reads data/mocked-data.json, calls addTenantConfig, writes back.
 * MSW mockServiceWorker.js is copied by the generator (vue-tenant.tpl.ts) — not this script.
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { addTenantConfig, type TenantConfig } from '@repo/generator/msw/add-tenant'
import { readMockedData, writeMockedData } from '@repo/generator/msw/file-io'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CONFIG_PATH = resolve(
  __dirname,
  '../packages/infra/src/mocks/data/mocked-data.json',
)

function printUsage(): never {
  console.error(
    'Usage: bun scripts/register-msw-tenant.ts --prefix <key> --names-json \'["name1","name2"]\'',
  )
  process.exit(1)
}

function parseArgs(): { prefix: string; names: string[] } {
  const args = process.argv.slice(2)

  const prefixIdx = args.indexOf('--prefix')
  const namesIdx = args.indexOf('--names-json')

  if (prefixIdx === -1 || namesIdx === -1) {
    printUsage()
  }

  const prefix = args[prefixIdx + 1]
  const namesJson = args[namesIdx + 1]

  if (!prefix || !namesJson) {
    printUsage()
  }

  let names: string[]
  try {
    names = JSON.parse(namesJson)
  } catch {
    console.error('Error: --names-json must be valid JSON')
    process.exit(1)
  }

  if (!Array.isArray(names) || names.length === 0) {
    console.error('Error: --names-json must be a non-empty JSON array of strings')
    process.exit(1)
  }

  return { prefix, names }
}

function main(): void {
  const { prefix, names } = parseArgs()

  let config: Record<string, TenantConfig>
  try {
    config = readMockedData(CONFIG_PATH)
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }

  let updated: Record<string, TenantConfig>
  try {
    updated = addTenantConfig(config, prefix, names)
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`)
    } else {
      console.error('Error: Unknown error')
    }
    process.exit(1)
  }

  try {
    writeMockedData(CONFIG_PATH, updated)
  } catch (err) {
    console.error(`Error: Failed to write ${CONFIG_PATH}: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
  console.log(`✅ Tenant "${prefix}" registered with ${names.length} name(s)`)
}

main()
