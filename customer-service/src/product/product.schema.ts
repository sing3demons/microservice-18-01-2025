import { Type } from '@sinclair/typebox'
import { Schema, model } from 'mongoose'

export interface IProduct {
  id?: string
  href?: string
  name: string
  detail: string
  price: number
  quantity: number

  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema = new Schema<IProduct>({
  // id: { type: String, index: true, required: true, auto: true, unique: true },
  name: { type: String, required: true },
  detail: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, required: false },
  updatedAt: { type: Date, required: false },
})

const ProductModel = model('product', ProductSchema, 'product')

const productSchema = Type.Object({
  name: Type.String(),
  detail: Type.String(),
  price: Type.Number(),
  quantity: Type.Number(),
})

const productQuerySchema = Type.Object({
  fields: Type.Optional(Type.String()),
  sort: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Number()),
  offset: Type.Optional(Type.Number()),
})

export { productSchema, productQuerySchema }

export default ProductModel
