import type { createProductDTO, IProduct } from './product.model'
import type { IProductRepository } from './product.repository'

export interface IProductService {
  createProduct(body: createProductDTO): Promise<IProduct>
  getProducts(): Promise<IProduct[]>
  getProductById(id: string): Promise<IProduct | null>
}

export default class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  public async createProduct(body: createProductDTO): Promise<IProduct> {
    return this.productRepository.create(body)
  }

  public async getProducts(): Promise<IProduct[]> {
    const result = await this.productRepository.getProducts()
    return result
  }

  public async getProductById(id: string): Promise<IProduct | null> {
    return this.productRepository.getProductById(id)
  }
}
