import { mock } from 'jest-mock-extended'
import ProductRepository from '../../product/product.repository'
import { IProduct } from '../../product/product.schema'
import ProductService from '../../product/product.service'
 
describe('Create Product Use Case', () => {
  it('should be create product.', async () => {
    // Arrange
    const productRepositoryMock = mock<ProductRepository>()
    const body: IProduct = {
      id: '1',
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    }
    productRepositoryMock.create.mockResolvedValue(body)
    const productService = new ProductService(productRepositoryMock)

    // Act
    const actual = await productService.createProduct(body)

    // Assert
    expect(actual).toEqual(body)
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
    const productService = new ProductService(productRepositoryMock)

    // Act

    const actual = await productService.getProducts()
    // console.log(actual)

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
    const productService = new ProductService(productRepositoryMock)

    // Act
    const actual = await productService.getProductById('1')

    // Assert
    expect(actual).toEqual(product)
    expect(actual?.href).toEqual('/products/1')
  })

  it('should be return null if product not found.', async () => {
    const productRepositoryMock = mock<ProductRepository>()
    productRepositoryMock.findById.mockResolvedValue(null)
    const productService = new ProductService(productRepositoryMock)

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
    const productService = new ProductService(productRepositoryMock)

    // Act
    const actual = await productService.updateProduct('1', product)

    // Assert
    expect(actual).toEqual(product)
    expect(actual?.href).toEqual('/products/1')
  })

  it('should be return null if product not found.', async () => {
    const productRepositoryMock = mock<ProductRepository>()
    productRepositoryMock.update.mockResolvedValue(null)
    const productService = new ProductService(productRepositoryMock)

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
    const productService = new ProductService(productRepositoryMock)

    // Act
    const actual = await productService.deleteProduct('1')

    // Assert
    expect(actual).toEqual(product)
    expect(actual?.href).toEqual('/products/1')
  })

  it('should be return null if product not found.', async () => {
    const productRepositoryMock = mock<ProductRepository>()
    productRepositoryMock.delete.mockResolvedValue(null)
    const productService = new ProductService(productRepositoryMock)

    // Act
    const actual = await productService.deleteProduct('1')

    // Assert
    expect(actual).toBeNull()
  })
})