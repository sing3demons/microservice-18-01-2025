import AppServer from './custom/server'
import productRouter from './product/product.controller'

const appServer = new AppServer()

appServer.router(productRouter)

export default appServer
