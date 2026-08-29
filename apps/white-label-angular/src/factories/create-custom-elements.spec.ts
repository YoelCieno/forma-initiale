import { describe, it, expect } from 'vitest'
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Type,
  ɵComponentType,
} from '@angular/core'
import { feComponent } from './create-custom-elements'

type ComponentType<T> = ɵComponentType<T>

const isChangeDetectionDef = (v: unknown): v is { changeDetection: ChangeDetectionStrategy } =>
  typeof v === 'object' && v !== null && 'changeDetection' in v

const isOnPushDef = (v: unknown): v is { onPush: boolean } =>
  typeof v === 'object' && v !== null && 'onPush' in v

const getChangeDetection = <T>(cmp: Type<T>): ChangeDetectionStrategy | undefined => {
  const def = (cmp as ComponentType<T>).ɵcmp
  if (isChangeDetectionDef(def)) return def.changeDetection
  if (isOnPushDef(def)) return def.onPush ? ChangeDetectionStrategy.OnPush : ChangeDetectionStrategy.Eager
  return undefined
}

describe('feComponent', () => {
  it('defaults schemas to [CUSTOM_ELEMENTS_SCHEMA]', () => {
    @feComponent({ selector: 'test-a', template: '' })
    class TestA {}

    expect(TestA).toBeDefined()
  })

  it('dedupes CUSTOM_ELEMENTS_SCHEMA when already present', () => {
    @feComponent({ selector: 'test-b', template: '', schemas: [CUSTOM_ELEMENTS_SCHEMA] })
    class TestB {}

    expect(TestB).toBeDefined()
  })

  it('merges caller schemas with CUSTOM_ELEMENTS_SCHEMA', () => {
    @feComponent({
      selector: 'test-c',
      template: '',
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    class TestC {}

    expect(TestC).toBeDefined()
  })

  it('defaults changeDetection to OnPush', () => {
    @feComponent({ selector: 'test-d', template: '' })
    class TestD {}

    expect(getChangeDetection(TestD)).toBe(ChangeDetectionStrategy.OnPush)
  })

  it('respects caller changeDetection override', () => {
    @feComponent({
      selector: 'test-e',
      template: '',
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestE {}

    expect(getChangeDetection(TestE)).toBe(ChangeDetectionStrategy.Eager)
  })
})
