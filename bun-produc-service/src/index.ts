import { initMongo } from './db'
import app from './server'

async function main() {
  await initMongo()

  app.listen(3001, () => {
    process.stdout.write('Server is running on port 3001\n')
  })
}

main()
