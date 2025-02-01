import { HandlerSchema } from '../lib/serve'
import { createProductSchema } from './product.model'
import type { IProductService } from './product.service'

export default class ProductHandler {
  constructor(private readonly productService: IProductService) {}

  public getProduct = HandlerSchema(async (ctx) => {
    const products = await this.productService.getProducts()
    ctx.response(200, products)
  })

  public createProduct = HandlerSchema(
    async (ctx) => {
      const product = await this.productService.createProduct(ctx.body)
      ctx.response(201, product)
    },
    {
      schema: {
        body: createProductSchema,
      },
    }
  )

  public getProductById = HandlerSchema(async (ctx) => {
    const product = await this.productService.getProductById(ctx.params.id)
    if (!product) {
      ctx.response(404, { message: 'Product not found' })
      return
    }
    ctx.response(200, product)
  })
}
