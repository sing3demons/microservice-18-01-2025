import mongoose from 'mongoose'
import appServer from './server'

async function connectToMongo() {
  await mongoose.connect('mongodb://localhost:27017/product', { promoteLongs: true })
  mongoose.set('debug', true)
  console.log('Connected to MongoDB')
}

async function main() {
  await connectToMongo()

  const port = 8080
  appServer.register()

  appServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
}

main()
