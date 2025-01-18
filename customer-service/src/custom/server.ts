import express, {
  type Request,
  type Response,
  type NextFunction,
  type Express,
  Application,
  CookieOptions,
} from 'express'
import { CtxSchema, HttpMethod, InternalRoute, InlineHandler, MiddlewareRoute, IExpressCookies } from './context.js'
import { TObject } from '@sinclair/typebox'
import useragent from 'useragent'
import { v4, v7 } from 'uuid'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import cookieParser from 'cookie-parser'

export class AppRouter {
  protected readonly _routes: InternalRoute[] = []

  private add(method: HttpMethod, path: string, handler: InlineHandler<any, any>, hook?: MiddlewareRoute<any>) {
    this._routes.push({ method, path, handler, hook })
    return this
  }

  public get = <const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ) => this.add(HttpMethod.GET, path, handler, hook)

  public post = <const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ) => this.add(HttpMethod.POST, path, handler, hook)

  public put = <const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ) => this.add(HttpMethod.PUT, path, handler, hook)

  public delete = <const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ) => this.add(HttpMethod.DELETE, path, handler, hook)

  public patch = <const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ) => this.add(HttpMethod.PATCH, path, handler, hook)

  public getRoutes = () => this._routes

  public build() {
    return this
  }
}

enum Framework {
  EXPRESS = 'express',
  FASTIFY = 'fastify',
}

const framework = {
  express: Framework.EXPRESS,
  fastify: Framework.FASTIFY,
} as const

type TFramework = keyof typeof framework

export default class AppServer extends AppRouter {
  public instance: Application | null = null
  constructor() {
    super()

    this.express = express()
    this.instance = this.express
    this.express.use((req: Request, _res: Response, next: NextFunction) => {
      const agent = useragent.parse(req.headers['user-agent'] || '')

      if (!req.headers['x-session']) {
        req.headers['x-session'] = v4()
      }

      if (!req.headers['x-tid']) {
        req.headers['x-tid'] = v7()
      }

      next()
    })

    this.express.use(express.json())
    this.express.use(express.urlencoded({ extended: true }))
    this.express.use(cookieParser())
  }

  private readonly express: Express | null = null

  public router(router: AppRouter) {
    router.getRoutes().forEach((e) => this._routes.push(e))
  }

  private validatorFactory(req: CtxSchema, schema: CtxSchema) {
    try {
      const errors = []
      if (schema.body) {
        const C = TypeCompiler.Compile(schema.body as TObject)
        const isValid = C.Check(req.body)
        if (!isValid) {
          errors.push(...[...C.Errors(req.body)].map((e) => ({ type: 'body', path: e.path, message: e.message })))
        }
      }

      if (schema.params) {
        const C = TypeCompiler.Compile(schema.params as TObject)
        const isValid = C.Check(req.params)
        if (!isValid) {
          errors.push(...[...C.Errors(req.params)].map((e) => ({ type: 'params', path: e.path, message: e.message })))
        }
      }

      if (schema.query) {
        const C = TypeCompiler.Compile(schema.query as TObject)
        const isValid = C.Check(req.query)
        if (!isValid) {
          errors.push(...[...C.Errors(req.query)].map((e) => ({ type: 'query', path: e.path, message: e.message })))
        }
      }

      if (schema.headers) {
        const C = TypeCompiler.Compile(schema.headers as TObject)
        const isValid = C.Check(req.headers)
        if (!isValid) {
          errors.push(...[...C.Errors(req.headers)].map((e) => ({ type: 'headers', path: e.path, message: e.message })))
        }
      }

      const isError = errors.length > 0 ? true : false
      return {
        err: isError,
        desc: isError ? 'invalid_request' : 'success',
        data: errors,
      }
    } catch (error) {
      return {
        err: true,
        desc: 'unknown_error',
        data: [error],
      }
    }
  }

  private createContext(req: Request, res: Response) {
    const contest = {
      body: req.body,
      headers: req.headers,
      params: req.params,
      query: req.query,
      response: (code: number, data: unknown) => {
        res.status(code).send(data)
      },
      set: {
        headers: {},
        status: 200,
        cookie:  {} as IExpressCookies,
      },
    }

    return contest
  }

  public register() {
    this._routes.forEach(({ method, path, handler, hook }) => {
      if (this.express) {
        this.express[method.toLowerCase() as keyof express.Application](path, async (req: Request, res: Response) => {
          const ctx = this.createContext(req, res)

          const schemas = hook?.schema || {}

          const schema = this.validatorFactory(ctx, schemas)
          if (schema.err) {
            return res.status(400).json({
              desc: schema.desc,
              data: schema.data,
            })
          }

          const result = await handler(ctx)

          if (ctx.set.status) {
            res.status(ctx.set.status)
          }

          // if (ctx.set.headers) {
          //   res.set(ctx.set.headers)
          // }

          // if (ctx.set.cookie) {
          //   res.cookie(ctx.set.cookie.name, ctx.set.cookie.value, ctx.set.cookie.options)
          // }

          if (result) {
            res.json(result)
          }
        })
      }
    })

    return this.express as Express
  }

  public listen(port: number, callback: (err?: Error) => void) {
    if (!this.express) {
      throw new Error('App is not initialized')
    }
    if (this.express) this.express.listen(port, callback)
  }
}

export function Router() {
  return new AppRouter()
}

// const router = Router()
// router
//   .get(
//     '/user/:id',
//     async ({ params, body, headers, query }) => {
//       return {}
//     },
//     {
//       schema: {
//         body: Type.Object({
//           id: Type.String(),
//         }),
//         params: Type.Object({
//           id: Type.String(),
//         }),
//         headers: Type.Object({
//           'x-custom-header': Type.String(),
//         }),
//       },
//     }
//   )
//   .post('/user/:id', async ({ params, body, headers, query }) => {
//     return {}
//   })

// const app = new AppServer()
// app.router(router)
// app.listen(3000, (err) => {
//   if (err) {
//     console.error(err)
//     process.exit(1)
//   }

//   console.log('Server is running')
// })
