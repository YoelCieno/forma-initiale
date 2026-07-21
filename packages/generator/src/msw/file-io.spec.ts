import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readMockedData, writeMockedData, copyMswWorker } from './file-io'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'file-io-test-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('readMockedData', () => {
  it('reads valid JSON file', () => {
    const path = join(tmpDir, 'valid.json')
    writeFileSync(path, JSON.stringify({ wl: { names: ['a'] } }))
    const result = readMockedData(path)
    expect(result).toEqual({ wl: { names: ['a'] } })
  })

  it('throws when file not found', () => {
    const path = join(tmpDir, 'nonexistent.json')
    expect(() => readMockedData(path)).toThrow(/Config file not found/)
  })

  it('throws when JSON is invalid', () => {
    const path = join(tmpDir, 'bad.json')
    writeFileSync(path, 'not-json')
    expect(() => readMockedData(path)).toThrow(/Invalid JSON/)
  })
})

describe('writeMockedData', () => {
  it('writes formatted JSON with trailing newline', () => {
    const path = join(tmpDir, 'out.json')
    writeMockedData(path, { wl: { names: ['a'], price: { base: 9.99, increment: 10 }, rateType: 'random' } })
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('"wl"')
    expect(content.endsWith('\n')).toBe(true)
    // Verify pretty-printed
    expect(content).toContain('  "')
  })

  it('overwrites existing file', () => {
    const path = join(tmpDir, 'overwrite.json')
    writeFileSync(path, JSON.stringify({ old: true }))
    writeMockedData(path, { new: { names: ['b'], price: { base: 9.99, increment: 10 }, rateType: 'random' } })
    const parsed = JSON.parse(readFileSync(path, 'utf-8'))
    expect(parsed).toEqual({ new: { names: ['b'], price: { base: 9.99, increment: 10 }, rateType: 'random' } })
  })
})

describe('copyMswWorker', () => {
  it('copies file to target directory', () => {
    const source = join(tmpDir, 'mockServiceWorker.js')
    const target = join(tmpDir, 'public', 'mockServiceWorker.js')
    writeFileSync(source, '// MSW worker')
    copyMswWorker(source, target)
    expect(existsSync(target)).toBe(true)
    expect(readFileSync(target, 'utf-8')).toBe('// MSW worker')
  })

  it('creates target directory if missing', () => {
    const source = join(tmpDir, 'worker.js')
    const target = join(tmpDir, 'deep/nested/public/worker.js')
    writeFileSync(source, 'content')
    copyMswWorker(source, target)
    expect(existsSync(target)).toBe(true)
  })

  it('throws when source not found', () => {
    const source = join(tmpDir, 'missing.js')
    const target = join(tmpDir, 'public/missing.js')
    expect(() => copyMswWorker(source, target)).toThrow(/MSW worker not found/)
  })

  it('does nothing when source equals target', () => {
    const path = join(tmpDir, 'same.js')
    writeFileSync(path, 'same')
    copyMswWorker(path, path)
    expect(readFileSync(path, 'utf-8')).toBe('same')
  })
})
