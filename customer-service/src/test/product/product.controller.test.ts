import request from 'supertest'
import { IProduct } from '../../product/product.schema'
import ProductService from '../../product/product.service'
import appServer from '../../server'

// jest.mock('../../product/product.service') // v1

describe('GET /products', () => {
  // const productService = jest.mocked(ProductService) // v1
  const ProductServiceMock = jest.mocked(ProductService)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks() // Clear all mocks between tests
  })

  test('should return a list of products', async () => {
    // Mock the return value of productService.getProducts
    const mockProducts: IProduct[] = [
      { id: '1', href: '/products/1', name: 'Product A', price: 100, detail: 'detail', quantity: 10 },
    ]
    // productService.prototype.getProducts.mockResolvedValue(mockProducts) // v1
    ProductServiceMock.prototype.getProducts = jest.fn().mockResolvedValue(mockProducts)

    const response = await request(appServer.register()).get('/products').set('Accept', 'application/json')
    // expect(productService.prototype.getProducts).toHaveBeenCalledTimes(1) // v1
    expect(ProductService.prototype.getProducts).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
  })

  test('should return 404 when no products are found', async () => {
    // Mock the return value of productService.getProducts
    // productService.prototype.getProducts.mockResolvedValue([]) // v1

    ProductServiceMock.prototype.getProducts = jest.fn().mockResolvedValue([])
    const response = await request(appServer.register()).get('/products').set('Accept', 'application/json')

    // expect(productService.prototype.getProducts).toHaveBeenCalledTimes(1) // v1
    expect(ProductService.prototype.getProducts).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(404)
    expect(response.body).toEqual([])
  })
})

describe('POST /products', () => {
  let productService: jest.MockedObjectDeep<typeof ProductService>

  beforeEach(() => {
    productService = jest.mocked(ProductService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should create a new product', async () => {
    const mockProduct: IProduct = { id: '1', name: 'Product A', price: 100, detail: 'detail', quantity: 10 }
    // productService.prototype.createProduct.mockResolvedValue(mockProduct)
    productService.prototype.createProduct = jest.fn().mockResolvedValue(mockProduct)

    const response = await request(appServer.register())
      .post('/products')
      .send(mockProduct)
      .set('Accept', 'application/json')

    expect(ProductService.prototype.createProduct).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProduct)
  })
})

describe('GET /products/:id', () => {
  let productService: jest.MockedObjectDeep<typeof ProductService>

  beforeEach(() => {
    productService = jest.mocked(ProductService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return a product by id', async () => {
    const mockProduct: IProduct = { id: '1', name: 'Product A', price: 100, detail: 'detail', quantity: 10 }
    productService.prototype.getProductById = jest.fn().mockResolvedValue(mockProduct)

    const response = await request(appServer.register()).get('/products/1').set('Accept', 'application/json')

    expect(ProductService.prototype.getProductById).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProduct)
  })

  test('should return 404 when no product is found', async () => {
    productService.prototype.getProductById = jest.fn().mockResolvedValue(null)

    const response = await request(appServer.register()).get('/products/1').set('Accept', 'application/json')

    expect(ProductService.prototype.getProductById).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(404)
    expect(response.body).toEqual({})
  })
})

describe('PUT /products/:id', () => {
  let productService: jest.MockedObjectDeep<typeof ProductService>

  beforeEach(() => {
    productService = jest.mocked(ProductService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should update a product by id', async () => {
    const mockProduct: IProduct = { id: '1', name: 'Product A', price: 100, detail: 'detail', quantity: 10 }
    productService.prototype.updateProduct = jest.fn().mockResolvedValue(mockProduct)

    const response = await request(appServer.register())
      .put('/products/1')
      .send(mockProduct)
      .set('Accept', 'application/json')

    expect(ProductService.prototype.updateProduct).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProduct)
  })

  test('should return 404 when no product is found', async () => {
    productService.prototype.updateProduct = jest.fn().mockResolvedValue(null)

    const response = await request(appServer.register())
      .put('/products/1')
      .send({
        name: 'Product A',
        price: 100,
        detail: 'detail',
        quantity: 10,
      })
      .set('Accept', 'application/json')

    expect(ProductService.prototype.updateProduct).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(404)
    expect(response.body).toEqual({})
  })
})

describe('DELETE /products/:id', () => {
  let productService: jest.MockedObjectDeep<typeof ProductService>

  beforeEach(() => {
    productService = jest.mocked(ProductService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should delete a product by id', async () => {
    const mockProduct: IProduct = { id: '1', name: 'Product A', price: 100, detail: 'detail', quantity: 10 }
    productService.prototype.deleteProduct = jest.fn().mockResolvedValue(mockProduct)

    const response = await request(appServer.register()).delete('/products/1').set('Accept', 'application/json')

    expect(ProductService.prototype.deleteProduct).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProduct)
  })

  test('should return 404 when no product is found', async () => {
    productService.prototype.deleteProduct = jest.fn().mockResolvedValue(null)

    const response = await request(appServer.register()).delete('/products/1').set('Accept', 'application/json')

    expect(ProductService.prototype.deleteProduct).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(404)
    expect(response.body).toEqual({})
  })
})
