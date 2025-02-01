import { Type, type Static } from '@sinclair/typebox'

export interface IProduct {
  id?: string
  href?: string
  name: string
  price: number
  description: string
}

export const createProductSchema = Type.Object({
  name: Type.String(),
  price: Type.Number(),
  description: Type.String(),
})

export type createProductDTO = Static<typeof createProductSchema>

export class ProductError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ProductError'
    this.status = status
  }
}
