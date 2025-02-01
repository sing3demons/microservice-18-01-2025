import express, { type Request, type Response, type NextFunction, type Express, type Application } from 'express'
import {
  type CtxSchema,
  HttpMethod,
  type InternalRoute,
  type InlineHandler,
  type MiddlewareRoute,
  type IExpressCookies,
  type ContainsWhitespace,
  type CustomHandler,
  type CustomRouteDefinition,
} from './context'
import type { TObject } from '@sinclair/typebox'
import useragent from 'useragent'
import { v4, v7 } from 'uuid'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import cookieParser from 'cookie-parser'
import { Socket } from 'net'
import http from 'http'

export const HandlerSchema = <T extends CtxSchema>(handler: CustomHandler<T>, hook?: MiddlewareRoute<T>) => ({
  handler,
  hook,
})

export interface IAppRouter {
  get<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  get<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  post<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  post<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  put<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  put<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  delete<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  delete<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  patch<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  patch<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  getRoutes(): InternalRoute[]
  Router<T extends string>(group?: ContainsWhitespace<T>): this
}

export class AppRouter implements IAppRouter {
  protected _routes: InternalRoute[] = []

  private add(method: HttpMethod, path: string, handler: InlineHandler<any, any>, hook?: MiddlewareRoute<any>) {
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    this._routes.push({ method, path, handler, hook })
    return this
  }

  public get<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  public get<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  public get<const P extends string, const R extends CtxSchema>(
    path: P,
    handlerOrOptions: InlineHandler<R, P> | CustomRouteDefinition<R>,
    hook?: MiddlewareRoute<R>
  ) {
    if (typeof handlerOrOptions === 'function') {
      return this.add(HttpMethod.GET, path, handlerOrOptions, hook)
    }
    return this.add(HttpMethod.GET, path, handlerOrOptions.handler as InlineHandler<any, any>, handlerOrOptions.hook)
  }

  public post<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  public post<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  public post<const P extends string, const R extends CtxSchema>(
    path: P,
    handlerOrOptions: InlineHandler<R, P> | CustomRouteDefinition<R>,
    hook?: MiddlewareRoute<R>
  ) {
    if (typeof handlerOrOptions === 'function') {
      return this.add(HttpMethod.POST, path, handlerOrOptions, hook)
    }
    return this.add(HttpMethod.POST, path, handlerOrOptions.handler as InlineHandler<any, any>, handlerOrOptions.hook)
  }

  public put<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  public put<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  public put<const P extends string, const R extends CtxSchema>(
    path: P,
    handlerOrOptions: InlineHandler<R, P> | CustomRouteDefinition<R>,
    hook?: MiddlewareRoute<R>
  ) {
    if (typeof handlerOrOptions === 'function') {
      return this.add(HttpMethod.PUT, path, handlerOrOptions, hook)
    }
    return this.add(HttpMethod.PUT, path, handlerOrOptions.handler as InlineHandler<any, any>, handlerOrOptions.hook)
  }

  public delete<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  public delete<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  public delete<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P> | CustomRouteDefinition<R>,
    hook?: MiddlewareRoute<R>
  ) {
    if (typeof handler === 'function') {
      return this.add(HttpMethod.DELETE, path, handler, hook)
    }
    return this.add(HttpMethod.DELETE, path, handler.handler as InlineHandler<any, any>, handler.hook)
  }

  public patch<const P extends string, const R extends CtxSchema>(path: P, options: CustomRouteDefinition<R>): this
  public patch<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P>,
    hook?: MiddlewareRoute<R>
  ): this
  public patch<const P extends string, const R extends CtxSchema>(
    path: P,
    handler: InlineHandler<R, P> | CustomRouteDefinition<R>,
    hook?: MiddlewareRoute<R>
  ) {
    if (typeof handler === 'function') {
      return this.add(HttpMethod.PATCH, path, handler, hook)
    }
    return this.add(HttpMethod.PATCH, path, handler.handler as InlineHandler<any, any>, handler.hook)
  }

  public getRoutes = () => this._routes

  public Router<T extends string>(group?: ContainsWhitespace<T>) {
    if (group) {
      if (group.startsWith('/')) {
        this._routes = this._routes.map((e) => ({ ...e, path: `${group}${e.path}`.replace(/\/$/, '') }))
      } else {
        this._routes = this._routes.map((e) => ({ ...e, path: `/${group}${e.path}`.replace(/\/$/, '') }))
      }
    }
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

export default class AppServer extends AppRouter {
  public instance: Application | null = null
  private readonly express: Express
  constructor() {
    super()

    this.express = express()
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
    this.instance = this.express
  }

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
        headers: undefined as Record<string, string> | undefined,
        status: 200,
        cookie: undefined as IExpressCookies | undefined,
      },
    }

    return contest
  }

  public register() {
    this._routes.forEach(({ method, path, handler, hook }) => {
      if (this.express) {
        this.express.route(path)[method](async (req: Request, res: Response, next: NextFunction) => {
          const ctx = this.createContext(req, res)
          const schemas = hook?.schema || {}
          const schema = this.validatorFactory(ctx, schemas)
          if (schema.err) {
            res.status(400).json({
              desc: schema.desc,
              data: schema.data,
            })
            return next()
          }

          const result = await handler(ctx)

          if (ctx.set.status) {
            res.status(ctx.set.status)
          }

          if (ctx.set.headers) {
            res.set(ctx.set.headers)
          }

          if (ctx.set.cookie) {
            res.cookie(ctx.set.cookie.name, ctx.set.cookie.value, ctx.set.cookie.options)
          }

          if (result) {
            res.json(result)
          }
        })
      }
    })

    this._routes.length = 0

    return this.express as Express
  }

  public listen(port: number, callback: (err?: Error) => void) {
    if (!this.express) {
      throw new Error('App is not initialized')
    }
    if (this.express) {
      if (this._routes.length !== 0) {
        this.register()
      }
      const server = http.createServer(this.express).listen(port, callback)

      const connections = new Set<Socket>()
      server.on('connection', (connection) => {
        connections.add(connection)
        connection.on('close', () => {
          connections.delete(connection)
        })
      })

      const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const
      signals.forEach((signal) => {
        process.on(signal, () => {
          console.log(`Received ${signal}. Closing server.`)
          server.close(() => {
            console.log('Server closed.')
            callback?.()
            process.exit(0)
          })

          setTimeout(() => {
            console.log('Could not close server in time. Forcing shutdown.')
            connections.forEach((connection) => {
              connection.destroy()
            })
            callback?.()
            process.exit(1)
          }, 10000)
        })
      })
      return server
    }
  }
}

export function Router() {
  return new AppRouter()
}
