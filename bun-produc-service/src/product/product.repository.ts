import { Collection, MongoServerError, ObjectId } from 'mongodb'
import type { createProductDTO, IProduct } from './product.model'

export interface IProductRepository {
  create(body: createProductDTO): Promise<IProduct>
  getProducts(): Promise<IProduct[]>
  getProductById(id: string): Promise<IProduct | null>
}

export default class ProductRepository implements IProductRepository {
  constructor(private readonly collection: Collection) {}

  public async create(body: createProductDTO): Promise<IProduct> {
    try {
      const doc = { ...body }
      const insertOneResult = await this.collection.insertOne(doc)
      if (!insertOneResult.insertedId) {
        throw new Error('An error occurred while creating a product')
      }

      return {
        id: insertOneResult.insertedId.toHexString(),
        href: `http://localhost:3000/products/${insertOneResult.insertedId.toHexString()}`,
        name: doc.name,
        price: doc.price,
        description: doc.description,
      }
    } catch (error) {
      if (error instanceof MongoServerError) {
        throw new Error(error.message)
      } else if (error instanceof Error) {
        throw new Error(error.message)
      }

      throw new Error('An error occurred while creating a product')
    }
  }

  public async getProducts(): Promise<IProduct[]> {
    const products = await this.collection.find().toArray()
    return products.map((product) => {
      return {
        id: product._id.toHexString(),
        name: product.name,
        href: `http://localhost:3000/products/${product._id.toHexString()}`,
        price: product.price,
        description: product.description,
      }
    })
  }

  public async getProductById(id: string): Promise<IProduct | null> {
    const product = await this.collection.findOne({ _id: ObjectId.createFromHexString(id) })
    if (!product) {
      return null
    }

    return {
      id: product._id.toHexString(),
      href: `http://localhost:3000/products/${product._id.toHexString()}`,
      name: product.name,
      price: product.price,
      description: product.description,
    }
  }
}
