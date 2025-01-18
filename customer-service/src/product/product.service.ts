import { IProduct } from './product.schema'
import { IProductRepository } from './product.repository'

export interface IProductService {
  createProduct(body: IProduct): Promise<IProduct>
  getProducts(): Promise<IProduct[]>
  getProductById(id: string): Promise<IProduct | null>
  updateProduct(id: string, body: IProduct): Promise<IProduct | null>
  deleteProduct(id: string): Promise<IProduct | null>
}

export default class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async createProduct(body: IProduct): Promise<IProduct> {
    return this.productRepository.create(body)
  }

  async getProducts(): Promise<IProduct[]> {
    const result = await this.productRepository.findAll()
    for (let i = 0; i < result.length; i++) {
      result[i].href = `/products/${result[i].id}`
    }

    return result
  }

  async getProductById(id: string): Promise<IProduct | null> {
    const product = await this.productRepository.findById(id)
    if (!product) {
      return null
    }

    product.href = `/products/${product.id}`
    return product
  }

  async updateProduct(id: string, body: IProduct): Promise<IProduct | null> {
    const product = await this.productRepository.update(id, body)
    if (!product) {
      return null
    }

    product.href = `/products/${product.id}`
    return product
  }


  async deleteProduct(id: string): Promise<IProduct | null> {
    const product = await this.productRepository.delete(id)
    if (!product) {
      return null
    }

    product.href = `/products/${product.id}`
    return product
  }
}
