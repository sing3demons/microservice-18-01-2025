import { Router } from '../custom/server'
import ProductRepository from './product.repository'
import ProductService, { IProductService } from './product.service'
import { productSchema } from './product.schema'
import { HttpService } from '../custom/http-service'

const httpService = new HttpService()

const productRepository = new ProductRepository()
const productService = new ProductService(productRepository, httpService)
const productRouter = Router()

productRouter.get(
  '/products',
  async (ctx) => {
    const product = await productService.getProducts()

    if (product.length === 0) {
      ctx.response(404, [])
      return
    }

    return ctx.response(200, product)
  },
  {
    // schema: { query: productQuerySchema },
  }
)

productRouter.post(
  '/products',
  async (ctx) => {
    const product = await productService.createProduct(ctx.body)
    return product
  },
  {
    schema: { body: productSchema },
  }
)

productRouter.get('/products/:id', async (ctx) => {
  const product = await productService.getProductById(ctx.params.id)
  if (!product) {
    ctx.response(404, {})
    return
  }

  return product
})

productRouter.put(
  '/products/:id',
  async (ctx) => {
    const product = await productService.updateProduct(ctx.params.id, ctx.body)
    if (!product) {
      ctx.response(404, {})
      return
    }

    return product
  },
  {
    schema: { body: productSchema },
  }
)

productRouter.delete('/products/:id', async (ctx) => {
  const product = await productService.deleteProduct(ctx.params.id)
  if (!product) {
    ctx.response(404, {})
    return
  }

  return product
})

// const productController = productRouter.build()
export default productRouter

type IParameters = {
  name: string
  in: string
  description?: string
  required: boolean
  type: string
  items: {
    type: string
  }
  collectionFormat?: string
}
type OpenAPI = {
  tags: string[]
  summary: string
  description: string
  operationId: string
  parameters: any[]
  requestBody: any
  responses: any
}
