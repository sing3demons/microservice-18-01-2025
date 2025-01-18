import mongoose from 'mongoose'
import appServer from './server'

async function connectToMongo() {
  await mongoose.connect('mongodb://localhost:27017/product', { promoteLongs: true })
  mongoose.set('debug', true)
  console.log('Connected to MongoDB')
}

const ProductSchema = new mongoose.Schema({
  _id: String,
  name: String,
  price: Number,
  description: String,
})

// const Product = mongoose.model('product', ProductSchema, 'product')

async function main() {
  await connectToMongo()


  // const app = express()
  // app.use(mLogger)

  // app.get('/products', productController.getProducts.bind(productController))

  // app.get('/products', async (req, res) => {
  //   const logger = req.logger.New('product')
  //   logger.addDetail('client', 'get_product', 'get_product', JSON.stringify(req.query), req.query)

  //   const fields = (req.query.fields as string) || ''

  //   const projection = fields.split(',').reduce((acc: { [key: string]: number }, field) => {
  //     acc[field] = 1
  //     return acc
  //   }, {})

  //   const rawData = `db.product.find({}, ${JSON.stringify(projection)})`

  //   logger.addDetail('mongo', 'find_product', 'product', rawData, {
  //     Collection: Product.collection.name,
  //     Method: 'find',
  //     Query: {},
  //     Projection: projection,
  //   })

  //   const products = await Product.find({}, fields.split(',').join(' ')).lean()

  //   logger.addDetail('mongo', 'find_product', 'product', JSON.stringify(products), products)
  //   res.json(products)
  // })

  const port = 8080
  appServer.register().listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })

  // app.listen(port, () => {
  //   console.log(`Server is running on http://localhost:${port}`)
  // })
}

main()
