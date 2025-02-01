import { Db, MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')

export async function initMongo() {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error while connecting to MongoDB', error)
  }
}

export const getMongoClient = (name: string): Db => {
  return client.db(name)
}
