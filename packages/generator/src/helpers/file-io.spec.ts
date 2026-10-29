import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileIo } from './file-io'
import { MockedData } from '../models'

const { readFileData, readRepoFile, writeFileData, copyMswWorker, readMirrorFiles } = fileIo()

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'file-io-test-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('readFileData', () => {
  it('reads valid JSON file', () => {
    const path = join(tmpDir, 'valid.json')
    writeFileSync(path, JSON.stringify({ wl: { names: ['a'] } }))
    const result = readFileData<MockedData>(path)
    expect(result).toEqual({ wl: { names: ['a'] } })
  })

  it('throws when file not found', () => {
    const path = join(tmpDir, 'nonexistent.json')
    expect(() => readFileData<MockedData>(path)).toThrow(/Config file not found/)
  })

  it('throws when JSON is invalid', () => {
    const path = join(tmpDir, 'bad.json')
    writeFileSync(path, 'not-json')
    expect(() => readFileData<MockedData>(path)).toThrow(/Invalid JSON/)
  })
})


describe('writeFileData', () => {
  it('writes formatted JSON with trailing newline', () => {
    const path = join(tmpDir, 'out.json')
    writeFileData(path, { wl: { names: ['a'], price: { base: 9.99, increment: 10 }, rateType: 'random' } })
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('"wl"')
    expect(content.endsWith('\n')).toBe(true)
    // Verify pretty-printed
    expect(content).toContain('  "')
  })

  it('overwrites existing file', () => {
    const path = join(tmpDir, 'overwrite.json')
    writeFileSync(path, JSON.stringify({ old: true }))
    writeFileData(path, { new: { names: ['b'], price: { base: 9.99, increment: 10 }, rateType: 'random' } })
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
})
describe('readRepoFile', () => {
  it('reads a repo-root-relative file (root package.json)', () => {
    const raw = readRepoFile('package.json')
    expect(raw).toContain('"name"')
  })

  it('throws with rel path when missing', () => {
    expect(() => readRepoFile('no/such/file.txt')).toThrow(/Repo file not found/)
  })
})

describe('readMirrorFiles', () => {
  it('returns zero-arg readers keyed by rel path', () => {
    const readers = readMirrorFiles(['package.json', 'packages/generator/package.json'], '.')
    expect(typeof readers['package.json']).toBe('function')
    expect(readers['package.json']()).toContain('"name"')
    expect(readers['packages/generator/package.json']()).toContain('"name"')
  })

  it('throws when a mirrored file is missing', () => {
    const readers = readMirrorFiles(['no/such/file.txt'], '.')
    expect(() => readers['no/such/file.txt']()).toThrow(/Repo file not found/)
  })
})
