import ProductHandler from './product.handler'
import ProductService from './product.service'
import ProductRepository from './product.repository'
import { getMongoClient } from '../db'
import { Router } from '../lib/serve'

const productDb = getMongoClient('product')
const productCollection = productDb.collection('product')
const productRepository = new ProductRepository(productCollection)
const productService = new ProductService(productRepository)
const productHandler = new ProductHandler(productService)

const productRouter = Router()

productRouter.post('/', productHandler.createProduct)
productRouter.get('/', productHandler.getProduct)
productRouter.get('/:id', productHandler.getProductById)

export default productRouter.Router('products')
