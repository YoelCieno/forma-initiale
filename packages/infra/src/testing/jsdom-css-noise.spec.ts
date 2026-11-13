import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Module side effect installs the filter on first import (setupFiles entry).
import { jsdomCssNoise } from './jsdom-css-noise'

// Fresh factory instance per describe — clean WeakMap/count-file state.
const { suppress, resetCount, Reporter } = jsdomCssNoise()

const countFile = (pid: number): string =>
  path.join(os.tmpdir(), `jsdom-css-noise-${pid}.counts`)

describe('suppress', () => {
  beforeEach(() => {
    resetCount()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rmSync(countFile(process.ppid), { force: true })
  })

  it('suppresses console.error calls whose first arg contains the jsdom CSS parse noise', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    suppress()

    console.error('Error: Could not parse CSS stylesheet', { href: 'nested.css' })

    expect(error).not.toHaveBeenCalled()
  })

  it('forwards all other console.error calls untouched', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    suppress()

    console.error('real failure', new Error('boom'))

    expect(error).toHaveBeenCalledWith('real failure', expect.any(Error))
  })

  it('is idempotent — second install does not double-wrap', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    suppress()
    suppress()

    console.error('Could not parse CSS stylesheet')

    expect(error.mock.calls.length).toBe(0)
  })

  it('records each dropped line in the run-scoped count file', () => {
    suppress()

    console.error('Could not parse CSS stylesheet')
    console.error('Could not parse CSS stylesheet')
    console.error('Could not parse CSS stylesheet')

    const raw = readFileSync(countFile(process.ppid), 'utf8')
    expect(raw.split('\n').filter((line) => line === '1')).toHaveLength(3)
  })

  it('reporter prints exactly one summary with the total and clears the file', () => {
    writeFileSync(countFile(process.pid), '1\n1\n1\n')
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    new Reporter().onTestRunEnd()

    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0]?.[0]).toBe(
      '[jsdom] suppressed 3 CSS parse failures (Could not parse CSS stylesheet)'
    )
    expect(existsSync(countFile(process.pid))).toBe(false)
  })

  it('reporter is silent when nothing was dropped', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    new Reporter().onTestRunEnd()

    expect(error).not.toHaveBeenCalled()
  })
})
