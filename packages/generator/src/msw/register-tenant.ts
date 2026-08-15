#!/usr/bin/env bun
/**
 * register-tenant.ts — CLI to add a tenant config entry to MSW mock data.
 *
 * Usage:
 *   bun packages/generator/src/msw/register-tenant.ts --prefix <key> --names-json '["name1","name2"]'
 *
 * Reads data/mocked-data.json, calls addTenantConfig, writes back.
 * MSW mockServiceWorker.js is copied by the generator (vue-tenant.tpl.ts) — not this script.
 */
import { resolve } from 'node:path'
import { addTenantConfig } from './add-tenant'
import { readMockedData, writeMockedData } from './file-io'
import { safeJsonParse } from '../helpers/safe-json-parse'
import { onExit } from '../helpers/error-utils'

// Resolves from repo root (always invoked from repo root via package.json script)
const CONFIG_PATH = resolve(process.cwd(), 'packages/infra/src/mocks/data/mocked-data.json')

const throwError = (): never => {
  throw new Error(
    'Usage: bun packages/generator/src/msw/register-tenant.ts --prefix <key> --names-json \'["name1","name2"]\'',
  )
}

const parseArgv = (): { prefix: string; namesJson: string } => {
  const args = process.argv.slice(2)

  const prefixIdx = args.indexOf('--prefix')
  const namesIdx = args.indexOf('--names-json')

  if (prefixIdx === -1 || namesIdx === -1) throwError()

  const prefix = args[prefixIdx + 1]
  const namesJson = args[namesIdx + 1]

  if (!prefix || !namesJson) throwError()

  return { prefix, namesJson }
}

const parseNames = (namesJson: string): string[] => {
  const names = safeJsonParse<string[]>(namesJson, '--names-json')

  if (!Array.isArray(names) || !names.length) {
    throw new Error('--names-json must be a non-empty JSON array of strings')
  }

  return names
}

export const getArgs = (): { prefix: string; names: string[] } => {
  const { prefix, namesJson } = parseArgv()
  return { prefix, names: parseNames(namesJson) }
}

export const main = (): void => {
  const { prefix, names } = onExit(() => getArgs())

  const config = onExit(() => readMockedData(CONFIG_PATH))
  const updated = onExit(() => addTenantConfig(config, prefix, names))

  onExit(() => writeMockedData(CONFIG_PATH, updated), `Failed to write ${CONFIG_PATH}`)
  console.log(`✅ Tenant "${prefix}" registered with ${names.length} name(s)`)
}

// Only run when executed directly (not when imported by tests)
if (!process.env['VITEST']) {
  main()
}
