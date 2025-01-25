import { mock } from 'jest-mock-extended'
import ProductRepository from '../../product/product.repository'
import { IProduct } from '../../product/product.schema'
import ProductService from '../../product/product.service'
import { IHttpService } from '../../custom/http-service'

const dataExternal = {
  Body: [
    // {
    //   id: '24cdfc4b-22fc-471c-8629-fc577d2b3fa4',
    //   _id: '24cdfc4b-22fc-471c-8629-fc577d2b3fa4',
    //   name: 'product1',
    //   price: 100,
    //   stock: 10,
    //   href: '/products/24cdfc4b-22fc-471c-8629-fc577d2b3fa4',
    // },
    // {
    //   id: '678d03aa6c8d5ccdb15c3b12',
    //   _id: '678d03aa6c8d5ccdb15c3b12',
    //   name: 'product1',
    //   detail: 'detail1',
    //   price: 100,
    //   quantity: 1,
    //   __v: 0,
    //   href: '/products/678d03aa6c8d5ccdb15c3b12',
    // },
    // {
    //   id: '678d03e55178972323aed8ef',
    //   _id: '678d03e55178972323aed8ef',
    //   name: 'product1',
    //   detail: 'detail1',
    //   price: 100,
    //   quantity: 1,
    //   __v: 0,
    //   href: '/products/678d03e55178972323aed8ef',
    // },
  ],
  Header: {
    'x-powered-by': 'Express',
    'content-type': 'application/json; charset=utf-8',
    'content-length': '551',
    etag: 'W/"227-lct0MYtRYBKIEW6lzWvnoPhAyG8"',
    date: 'Sun, 19 Jan 2025 13:53:41 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5',
  },
  Status: 200,
  StatusText: 'OK',
}

describe('product service', () => {
  let httpServiceMock: IHttpService = mock<IHttpService>()

  beforeAll(() => {})
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('Create Product Use Case', () => {
    it('should be create product.', async () => {
      // Arrange
      httpServiceMock.get = jest.fn().mockReturnValue(dataExternal)
      const productRepositoryMock = mock<ProductRepository>()
      const body: IProduct = {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }
      productRepositoryMock.create.mockResolvedValue(body)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.createProduct(body)
      // Assert
      expect(httpServiceMock.get).toHaveBeenCalledTimes(1)
      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: 'http://localhost:8081/products',
        headers: {
          'Content-Type': 'application/json',
        },
        query: { search: body.name },
      })

      expect(actual.id).toEqual(body.id)
      expect(actual.name).toEqual(body.name)
      expect(actual.price).toEqual(body.price)
      expect(actual.detail).toEqual(body.detail)
      expect(actual.quantity).toEqual(body.quantity)
      expect(productRepositoryMock.create).toHaveBeenCalled()
      expect(productRepositoryMock.create).toHaveBeenCalledWith(body)
    })

    it('should return product from external service when it exists.', async () => {
      // Arrange
      const externalProduct: IProduct = {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }
      const externalData = { ...dataExternal, Body: [externalProduct] }
      httpServiceMock.get = jest.fn().mockReturnValue(externalData)
      const productRepositoryMock = mock<ProductRepository>()
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.createProduct(externalProduct)

      // Assert
      expect(httpServiceMock.get).toHaveBeenCalledTimes(1)
      expect(actual.id).toEqual(externalProduct.id)
      expect(actual.name).toEqual(externalProduct.name)
      expect(actual.price).toEqual(externalProduct.price)
      expect(actual.detail).toEqual(externalProduct.detail)
      expect(actual.quantity).toEqual(externalProduct.quantity)
      expect(actual.href).toEqual(`/products/${externalProduct.id}`)

      expect(productRepositoryMock.create).not.toHaveBeenCalled()

    })
  })

  describe('Get Product Use Case', () => {
    it('should be get products.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      const products: IProduct[] = [
        {
          id: '1',
          name: 'product',
          price: 100,
          detail: 'detail',
          quantity: 10,
        },
      ]

      productRepositoryMock.findAll.mockResolvedValue(products)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act

      const actual = await productService.getProducts()

      expect(actual).toEqual(products)
      expect(actual[0].href).toEqual('/products/1')
    })
  })

  describe('Get Product By Id Use Case', () => {
    it('should be get product by id.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      const product: IProduct = {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }

      productRepositoryMock.findById.mockResolvedValue(product)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.getProductById('1')

      // Assert
      expect(actual).toEqual(product)
      expect(actual?.href).toEqual('/products/1')
    })

    it('should be return null if product not found.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      productRepositoryMock.findById.mockResolvedValue(null)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.getProductById('1')

      // Assert
      expect(actual).toBeNull()
    })
  })

  describe('Update Product Use Case', () => {
    it('should be update product.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      const product: IProduct = {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }

      productRepositoryMock.update.mockResolvedValue(product)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.updateProduct('1', product)

      // Assert
      expect(actual).toEqual(product)
      expect(actual?.href).toEqual('/products/1')
    })

    it('should be return null if product not found.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      productRepositoryMock.update.mockResolvedValue(null)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.updateProduct('1', {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      })

      // Assert
      expect(actual).toBeNull()
    })
  })

  describe('Delete Product Use Case', () => {
    it('should be delete product.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      const product: IProduct = {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }

      productRepositoryMock.delete.mockResolvedValue(product)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.deleteProduct('1')

      // Assert
      expect(actual).toEqual(product)
      expect(actual?.href).toEqual('/products/1')
    })

    it('should be return null if product not found.', async () => {
      const productRepositoryMock = mock<ProductRepository>()
      productRepositoryMock.delete.mockResolvedValue(null)
      const productService = new ProductService(productRepositoryMock, httpServiceMock)

      // Act
      const actual = await productService.deleteProduct('1')

      // Assert
      expect(actual).toBeNull()
    })
  })
})
