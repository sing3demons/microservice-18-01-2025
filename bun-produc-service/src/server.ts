 import AppServer from './lib/serve'
import productRouter from './product/product.route'
 
const app = new AppServer()

app.router(productRouter)

export default app.register()
