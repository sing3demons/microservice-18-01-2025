import { mock } from 'jest-mock-extended'
import ProductRepository from '../../product/product.repository'
import ProductModel, { IProduct } from '../../product/product.schema'

jest.mock('../../product/product.schema', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}))

describe('Create Product Use Case', () => {
  const productRepository = new ProductRepository()
  const productModel = jest.mocked(ProductModel)

  beforeEach(() => {
    jest.resetAllMocks() // Clear previous mocks
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should create a product.', async () => {
    // Arrange
    const body: IProduct = {
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    }

    const createMock = jest.fn().mockResolvedValue({
      _id: '507f191e810c19729de860ea',
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
      _v: 0,
    })

    productModel.create = createMock
    // Act
    const actual = await productRepository.create(body)

    // Assert

    const expected = {
      id: '507f191e810c19729de860ea',
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    }
    expect(actual).toEqual(expected)
    expect(ProductModel.create).toHaveBeenCalled()
  })
})

describe('Get Product Use Case', () => {
  const productRepository = new ProductRepository()
  const productModel = jest.mocked(ProductModel)

  beforeEach(() => {
    jest.resetAllMocks() // Clear previous mocks
  })

  it('should get products.', async () => {
    // Arrange
    const products: IProduct[] = [
      {
        id: '1',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      },
    ]

    productModel.find = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: '1',
            name: 'product',
            price: 100,
            detail: 'detail',
            quantity: 10,
          },
        ]),
      }),
    })

    // Act
    const actual = await productRepository.findAll()

    // Assert
    expect(actual).toEqual(products)
    expect(ProductModel.find).toHaveBeenCalled()
    expect(ProductModel.find().lean).toHaveBeenCalled()
  })
})

describe('Get Product By Id Use Case', () => {
  const productRepository = new ProductRepository()
  const productModel = jest.mocked(ProductModel)

  beforeEach(() => {
    jest.resetAllMocks() // Clear previous mocks
  })

  it('should get product by id.', async () => {
    // Arrange
    const product: IProduct = {
      id: '507f191e810c19729de860ea',
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    }

    const lean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: '507f191e810c19729de860ea',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }),
    })

    productModel.findById = jest.fn().mockReturnValue({
      lean,
    })

    // Act
    const actual = await productRepository.findById('507f191e810c19729de860ea')

    // Assert
    expect(actual).toEqual(product)
    expect(ProductModel.findById).toHaveBeenCalled()
  })

  // not found
  it('should return null if product not found.', async () => {
    // Arrange

    productModel.findById = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    })

    // Act
    const actual = await productRepository.findById('507f191e810c19729de860ea')

    // Assert
    expect(actual).toBeNull()
    expect(ProductModel.findById).toHaveBeenCalled()
  })
})

describe('Update Product Use Case', () => {
  const productRepository = new ProductRepository()
  const productModel = jest.mocked(ProductModel)

  beforeEach(() => {
    jest.resetAllMocks() // Clear previous mocks
  })

  it('should update product.', async () => {
    // Arrange
    const product: IProduct = {
      id: '507f191e810c19729de860ea',
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    }

    const lean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: '507f191e810c19729de860ea',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }),
    })

    productModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      lean,
    })

    // Act
    const actual = await productRepository.update('507f191e810c19729de860ea', product)

    // Assert
    expect(actual).toEqual(product)
    expect(ProductModel.findByIdAndUpdate).toHaveBeenCalled()
  })

  // not found
  it('should return null if product not found.', async () => {
    // Arrange
    const lean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    const findByIdAndUpdateMock = jest.fn().mockReturnValue({
      lean,
    })
    productModel.findByIdAndUpdate = findByIdAndUpdateMock

    // Act
    const actual = await productRepository.update('507f191e810c19729de860ea', {
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    })

    // Assert
    expect(actual).toBeNull()
    expect(ProductModel.findByIdAndUpdate).toHaveBeenCalled()
  })
})

describe('Delete Product Use Case', () => {
  const productRepository = new ProductRepository()
  const productModel = jest.mocked(ProductModel)

  beforeEach(() => {
    jest.resetAllMocks() // Clear previous mocks
  })

  it('should delete product.', async () => {
    // Arrange
    const product: IProduct = {
      id: '507f191e810c19729de860ea',
      name: 'product',
      price: 100,
      detail: 'detail',
      quantity: 10,
    }

    const lean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: '507f191e810c19729de860ea',
        name: 'product',
        price: 100,
        detail: 'detail',
        quantity: 10,
      }),
    })

    const findByIdAndDeleteMock = jest.fn().mockReturnValue({
      lean,
    })
    productModel.findByIdAndDelete = findByIdAndDeleteMock

    // Act
    const actual = await productRepository.delete('507f191e810c19729de860ea')

    // Assert
    expect(actual).toEqual(product)
    expect(ProductModel.findByIdAndDelete).toHaveBeenCalled()
  })

  // not found
  it('should return null if product not found.', async () => {
    // Arrange
    const lean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })
    const findByIdAndDeleteMock = jest.fn().mockReturnValue({ lean })
    productModel.findByIdAndDelete = findByIdAndDeleteMock

    // Act
    const actual = await productRepository.delete('507f191e810c19729de860ea')

    // Assert
    expect(actual).toBeNull()
    expect(ProductModel.findByIdAndDelete).toHaveBeenCalled()
  })
})
