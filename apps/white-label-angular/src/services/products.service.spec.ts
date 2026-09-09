import { describe, it, expect, vi, beforeEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ProductsService } from './products.service'

vi.mock('@repo/infra', () => ({
  getProducts: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}))

describe('ProductsService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    vi.clearAllMocks()
  })

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
    return TestBed.inject(ProductsService)
  }

  it('is provided in root (singleton)', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
    const a = TestBed.inject(ProductsService)
    const b = TestBed.inject(ProductsService)
    expect(a).toBe(b)
  })

  it('exposes expected API shape', () => {
    const catalog = setup()
    expect(typeof catalog.reload).toBe('function')
    expect(typeof catalog.hasValue).toBe('function')
  })
})
