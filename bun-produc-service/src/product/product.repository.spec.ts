import { describe, test, expect, beforeEach, mock, spyOn, afterEach } from 'bun:test'
import { Collection, ObjectId } from 'mongodb'
import ProductRepository, { type IProductRepository } from './product.repository'
import type { createProductDTO, IProduct } from './product.model'

class MockCollection {
  insertOne = mock()
  find = mock(() => ({
    toArray: mock(),
  }))
  findOne = mock()
}

describe('ProductRepository', () => {
  let collection: MockCollection
  let productRepository: IProductRepository

  beforeEach(() => {
    collection = new MockCollection()
    productRepository = new ProductRepository(collection as unknown as Collection)
  })

  afterEach(() => {
    collection.insertOne.mockClear()
    collection.find.mockClear()
    collection.findOne.mockClear()
  })

  test('should create a product', async () => {
    const testId = new ObjectId()

    const mockProduct = {
      id: testId.toHexString(),
      href: `http://localhost:3000/products/${testId.toHexString()}`,
      name: 'Test Product',
      description: 'test',
      price: 100,
    }
    // collection.insertOne.mockResolvedValue({ insertedId: testId })
    const insetSpy = spyOn(collection, 'insertOne').mockResolvedValue({ insertedId: testId })

    const body: createProductDTO = { name: 'Test Product', description: 'test', price: 100 }

    const result = await productRepository.create(body)
    expect(result).toEqual(mockProduct)
    // expect(collection.insertOne).toHaveBeenCalledWith(body)
    expect(insetSpy).toHaveBeenCalledTimes(1)
    expect(insetSpy).toHaveBeenCalledWith(body)
    insetSpy.mockRestore()
  })

  test('should get all products', async () => {
    const testId = new ObjectId()
    const mockProduct = {
      id: testId.toHexString(),
      href: `http://localhost:3000/products/${testId.toHexString()}`,
      name: 'Test Product',
      description: 'test',
      price: 100,
    } as IProduct

    collection.find.mockImplementation(() => ({
      toArray: mock(() => [
        {
          _id: testId,
          name: 'Test Product',
          description: 'test',
          price: 100,
        },
      ]),
    }))

    const result = await productRepository.getProducts()

    expect(result).toEqual([mockProduct])
  })

  test('should get a product by id', async () => {
    const mockId = '67962e06705d207a9c259848'
    const testId = ObjectId.createFromHexString(mockId)
    const mockProduct = {
      id: testId.toHexString(),
      href: `http://localhost:3000/products/${testId.toHexString()}`,
      name: 'Test Product',
      description: 'test',
      price: 100,
    } as IProduct

    const spyFindOne = spyOn(collection, 'findOne').mockResolvedValueOnce({
      _id: testId,
      name: 'Test Product',
      description: 'test',
      price: 100,
    })

    const result = await productRepository.getProductById(mockId)
    expect(result).toEqual(mockProduct)
    expect(spyFindOne).toHaveBeenCalledWith({ _id: testId })
    spyFindOne.mockRestore()
  })

  test('should get a product by id return null', async () => {
    const mockId = '67962e06705d207a9c259848'
    const testId = ObjectId.createFromHexString(mockId)

    const spyFindOne = spyOn(collection, 'findOne').mockResolvedValueOnce(null)

    const result = await productRepository.getProductById(mockId)
    expect(result).toBeNull()
    expect(spyFindOne).toHaveBeenCalledWith({ _id: testId })
    spyFindOne.mockRestore()
  })
})
