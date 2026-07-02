import { describe, it, expect } from 'vitest'
import { tenantPrompts } from './index'

interface TestPrompt {
  type: string
  name: string
  message: string
  default?: unknown
  choices?: Array<{ name: string; value: string }>
  when?: (answers: Record<string, unknown>) => boolean
  validate?: (input: string) => boolean | string
}

function findPrompt(name: string): TestPrompt {
  const found = (tenantPrompts as TestPrompt[]).find((q) => q.name === name)
  if (!found) throw new Error(`Prompt "${name}" not found`)
  return found
}

describe('tenantPrompts', () => {
  it('exports an array of prompts', () => {
    expect(Array.isArray(tenantPrompts)).toBe(true)
  })

  it('has a name prompt with kebab-case validation', () => {
    const p = findPrompt('name')
    expect(p.type).toBe('input')
    expect(p.validate!('valid-name')).toBe(true)
    expect(p.validate!('UpperCase')).not.toBe(true)
    expect(p.validate!('with space')).not.toBe(true)
    expect(p.validate!('123startswithnumber')).not.toBe(true)
    expect(p.validate!('')).not.toBe(true)
  })

  it('has a description input with no extra validation', () => {
    const p = findPrompt('description')
    expect(p.type).toBe('input')
  })

  it('has metadataMode list with fixture and none choices', () => {
    const p = findPrompt('metadataMode')
    expect(p.type).toBe('list')
    expect(p.choices).toHaveLength(2)
    expect(p.choices![0].value).toBe('fixture')
    expect(p.choices![1].value).toBe('none')
  })

  it('has theme list with default, awesome, shoelace, custom', () => {
    const p = findPrompt('theme')
    expect(p.type).toBe('list')
    expect(p.choices).toHaveLength(4)
    expect(p.choices!.map((c) => c.value)).toEqual([
      'default',
      'awesome',
      'shoelace',
      'custom',
    ])
  })

  it('has brandHex input with hex validation, only when theme is custom', () => {
    const p = findPrompt('brandHex')
    expect(p.type).toBe('input')
    expect(p.default).toBe('#16a34a')
    expect(p.when!({ theme: 'custom' })).toBe(true)
    expect(p.when!({ theme: 'default' })).toBe(false)
    expect(p.validate!('#ff6600')).toBe(true)
    expect(p.validate!('#fff')).toBe(true)
    expect(p.validate!('not-a-color')).not.toBe(true)
  })

  it('has overrideComponent confirm with default false', () => {
    const p = findPrompt('overrideComponent')
    expect(p.type).toBe('confirm')
    expect(p.default).toBe(false)
  })

  it('has overrideComponentName input, only when overrideComponent is true', () => {
    const p = findPrompt('overrideComponentName')
    expect(p.type).toBe('input')
    expect(p.when!({ overrideComponent: true })).toBe(true)
    expect(p.when!({ overrideComponent: false })).toBe(false)
    expect(p.validate!('ProductCard')).toBe(true)
    expect(p.validate!('')).not.toBe(true)
    expect(p.validate!('lowercase')).not.toBe(true)
  })
})
