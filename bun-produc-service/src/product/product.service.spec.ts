import { test, expect, mock, beforeEach, describe } from 'bun:test'
import { type IProductRepository } from './product.repository'
import ProductService, { type IProductService } from './product.service'
import type { createProductDTO, IProduct } from './product.model'

class MockProductRepository implements IProductRepository {
  create = mock()
  getProducts = mock()
  getProductById = mock()
}

describe('ProductService', () => {
  let productService: IProductService
  let productRepository: MockProductRepository

  beforeEach(() => {
    productRepository = new MockProductRepository()
    productService = new ProductService(productRepository)
  })

  test('should create a product', async () => {
    const mockProduct = { id: '1', name: 'Test Product' } as IProduct
    productRepository.create.mockResolvedValue(mockProduct)

    const body:createProductDTO = { name: 'Test Product' } as createProductDTO

    const result = await productService.createProduct(body)
    expect(result).toEqual(mockProduct)
    expect(productRepository.create).toHaveBeenCalledWith({ name: 'Test Product' })
  })

    test('should get all products', async () => {
        const mockProducts = [{ id: '1', name: 'Test Product' } ]as IProduct[]
        productRepository.getProducts.mockResolvedValue(mockProducts)
    
        const result = await productService.getProducts()
        expect(result).toEqual(mockProducts)
        expect(productRepository.getProducts).toHaveBeenCalledTimes(1)
    })

    test('should get a product by id', async () => {
        const mockProduct = { id: '1', name: 'Test Product' } as IProduct
        productRepository.getProductById.mockResolvedValue(mockProduct)
    
        const result = await productService.getProductById('1')
        expect(result).toEqual(mockProduct)
        expect(productRepository.getProductById).toHaveBeenCalledWith('1')
    })
})
