import ProductModel, { IProduct, ProductFactory } from './product.schema'
import { v7 } from 'uuid'

export interface IProductRepository {
  create(product: IProduct): Promise<IProduct>
  findAll(filter?: Record<string, unknown>): Promise<IProduct[]>
  findById(id: string): Promise<IProduct | null>
  update(id: string, product: IProduct): Promise<IProduct | null>
  delete(id: string): Promise<IProduct | null>
}

export default class ProductRepository implements IProductRepository {
  public async create(product: IProduct): Promise<IProduct> {
    product._id = v7()
    const result = await ProductModel.create(product)

    return {
      id: result._id,
      name: result.name,
      detail: result.detail,
      price: result.price,
      quantity: result.quantity,
    }
  }

  public async findAll(filter?: Record<string, unknown>): Promise<IProduct[]> {
    const result = await ProductModel.find().lean().exec()

    return result.map((product) => ({
      id: product._id,
      name: product.name,
      detail: product.detail,
      price: product.price,
      quantity: product.quantity,
    }))
  }

  public async findById(id: string): Promise<IProduct | null> {
    const product = await ProductModel.findById(id).lean().exec()
    if (!product) {
      return null
    }

    return {
      id: product._id,
      name: product.name,
      detail: product.detail,
      price: product.price,
      quantity: product.quantity,
    }
  }

  public async update(id: string, product: IProduct): Promise<IProduct | null> {
    const result = await ProductModel.findByIdAndUpdate(id, product).lean().exec()
    if (!result) {
      return null
    }

    return {
      id: result._id,
      ...product,
    }
  }

  public async delete(id: string): Promise<IProduct | null> {
    const product = await ProductModel.findByIdAndDelete(id).lean().exec()
    if (!product) {
      return null
    }

    const { _id, ...rest } = product

    return {
      id: _id,
      ...rest,
    }
  }
}
