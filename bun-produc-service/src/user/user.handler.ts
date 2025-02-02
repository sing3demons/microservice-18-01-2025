import { Type } from '@sinclair/typebox'
import { HandlerSchema } from '../lib/serve'

export default class UserHandler {
  constructor() {}

  public getUserById = HandlerSchema(
    async (ctx) => {
      if (ctx.params.id === '5') {
        ctx.response(400, {})
      }
      ctx.response(200, {
        id: ctx.params.id,
        href: `/user/${ctx.params.id}`,
        name: 'user: ' + ctx.params.id,
      })
    },
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
      },
    }
  )
}
