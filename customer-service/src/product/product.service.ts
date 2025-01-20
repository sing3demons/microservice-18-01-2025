import { IProduct } from './product.schema'
import { IProductRepository } from './product.repository'
import { IHttpService } from '../custom/http-service'

export interface IProductService {
  createProduct(body: IProduct): Promise<IProduct>
  getProducts(): Promise<IProduct[]>
  getProductById(id: string): Promise<IProduct | null>
  updateProduct(id: string, body: IProduct): Promise<IProduct | null>
  deleteProduct(id: string): Promise<IProduct | null>
}

export default class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository, private readonly httpService: IHttpService) {}

  async createProduct(body: IProduct): Promise<IProduct> {
    const httpResult = await this.httpService.get({
      url: 'http://localhost:8081/products',
      headers: {
        'Content-Type': 'application/json',
      },
      query: {
        search: body.name,
      },
    })

    console.log(httpResult.Body.data)

    if (httpResult.Status === 200 && httpResult.Body.data.length > 0) {
      const data = httpResult.Body.data[0] as IProduct
      return {
        id: data.id,
        href: `/products/${data.id}`,
        name: data.name,
        price: data.price,
        detail: data.detail,
        quantity: data.quantity,
      }
    }

    const result = await this.productRepository.create(body)

    return result
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
