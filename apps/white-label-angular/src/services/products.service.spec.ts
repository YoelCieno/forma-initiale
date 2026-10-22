import { describe, it, expect, vi, beforeEach } from 'vitest'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { getProducts } from '@repo/infra'
import { APP_ENV } from '../bootstrap/init'
import { environment } from '../environments/environment'
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
      providers: [provideZonelessChangeDetection(), { provide: APP_ENV, useValue: environment }],
    })
    return TestBed.inject(ProductsService)
  }

  it('is provided in root (singleton)', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: APP_ENV, useValue: environment }],
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

  it('fetches products using injected APP_ENV (tenant fp)', async () => {
    const env = {
      apiUrl: 'https://api.example.com/api',
      tenantId: 'fp',
      enableMocks: true,
    }
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: APP_ENV, useValue: env }],
    })
    const catalog = TestBed.inject(ProductsService)
    catalog.items()

    await vi.waitFor(() =>
      expect(getProducts).toHaveBeenCalledWith({
        baseUrl: 'https://api.example.com/api',
        tenantId: 'fp',
      }),
    )
  })
})
