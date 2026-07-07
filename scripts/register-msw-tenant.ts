#!/usr/bin/env bun
/**
 * register-msw-tenant.ts — CLI to add a tenant config entry to MSW mock data.
 *
 * Usage:
 *   bun scripts/register-msw-tenant.ts --prefix <key> --names-json '["name1","name2"]' [--public-dir <path>]
 *
 * Reads data/mocked-data.json, calls addTenantConfig, writes back.
 * If --public-dir is given, copies MSW mockServiceWorker.js there from white-label-vue.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { addTenantConfig, type TenantConfig } from '../packages/generator/src/msw/add-tenant'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CONFIG_PATH = resolve(
  __dirname,
  '../packages/infra/src/mocks/data/mocked-data.json',
)

function printUsage(): never {
  console.error(
    'Usage: bun scripts/register-msw-tenant.ts --prefix <key> --names-json \'["name1","name2"]\' [--public-dir <path>]',
  )
  process.exit(1)
}

function parseArgs(): { prefix: string; names: string[]; publicDir?: string } {
  const args = process.argv.slice(2)

  const prefixIdx = args.indexOf('--prefix')
  const namesIdx = args.indexOf('--names-json')
  const publicDirIdx = args.indexOf('--public-dir')

  if (prefixIdx === -1 || namesIdx === -1) {
    printUsage()
  }

  const prefix = args[prefixIdx + 1]
  const namesJson = args[namesIdx + 1]
  const publicDir = publicDirIdx !== -1 ? args[publicDirIdx + 1] : undefined

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

  return { prefix, names, publicDir }
}

function readConfig(): Record<string, TenantConfig> {
  if (!existsSync(CONFIG_PATH)) {
    console.error(`Error: Config file not found — ${CONFIG_PATH}`)
    process.exit(1)
  }

  let raw: string
  try {
    raw = readFileSync(CONFIG_PATH, 'utf-8')
  } catch (err) {
    console.error(`Error: Failed to read ${CONFIG_PATH}`, err)
    process.exit(1)
  }

  try {
    return JSON.parse(raw) as Record<string, TenantConfig>
  } catch {
    console.error(`Error: Invalid JSON in ${CONFIG_PATH}`)
    process.exit(1)
  }
}

function writeConfig(data: Record<string, TenantConfig>): void {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2) + '\n')
  } catch (err) {
    console.error(`Error: Failed to write ${CONFIG_PATH}`, err)
    process.exit(1)
  }
}

function copyMswWorker(publicDir: string): void {
  const source = resolve(__dirname, '../apps/white-label-vue/public/mockServiceWorker.js')
  const target = resolve(__dirname, '..', publicDir, 'mockServiceWorker.js')

  if (!existsSync(source)) {
    console.error(`Warning: MSW worker not found at ${source}`)
    return
  }

  if (source === target) {
    console.log('ℹ️ Source and target are the same — skipping copy')
    return
  }

  const targetDir = resolve(__dirname, '..', publicDir)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  copyFileSync(source, target)
  console.log(`✅ mockServiceWorker.js copied to ${publicDir}/`)
}

function main(): void {
  const { prefix, names, publicDir } = parseArgs()
  const config = readConfig()

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

  writeConfig(updated)
  console.log(`✅ Tenant "${prefix}" registered with ${names.length} name(s)`)

  if (publicDir) {
    copyMswWorker(publicDir)
  }
}

main()
