import { Type } from '@sinclair/typebox'
import AppServer, { AppRouter, Router } from '../../custom/server'
import supertest from 'supertest'

describe('AppServerx', () => {
  // test router

  it('should be create router.', () => {
    const appRouter = Router()
    expect(appRouter).toBeDefined()
  })

  it('should be register routes.', () => {
    const appRouter = Router()
    appRouter.get(
      '/products',
      async (ctx) => {
        return ctx.response(200, [])
      },
      {
        // schema: { query: productQuerySchema },
      }
    )

    expect(appRouter).toBeDefined()

    expect(appRouter.getRoutes).toBeDefined()
  })

  it('should be get routes.', () => {
    const appRouter = Router()
    appRouter.get(
      '/products',
      async (ctx) => {
        return ctx.response(200, [])
      },
      {
        // schema: { query: productQuerySchema },
      }
    )

    const routes = appRouter.getRoutes()

    expect(routes).toBeDefined()
    expect(routes.length).toBeGreaterThan

    expect(routes[0].path).toBe('/products')
    expect(routes[0].method).toBe('get')
  })

  // post
  it('should be create post route.', () => {
    const appRouter = Router()
    appRouter.post('/products', async (ctx) => {
      return ctx.response(200, [])
    })
    const routes = appRouter.getRoutes()
    expect(appRouter).toBeDefined()

    expect(routes).toBeDefined()
    expect(routes.length).toBeGreaterThan
    expect(routes[0].path).toBe('/products')
    expect(routes[0].method).toBe('post')
  })

  // put
  it('should be create put route.', () => {
    const appRouter = Router()
    appRouter.put('/products', async (ctx) => {
      return ctx.response(200, [])
    })
    const routes = appRouter.getRoutes()
    expect(appRouter).toBeDefined()
    expect(routes).toBeDefined()
    expect(routes.length).toBeGreaterThan
    expect(routes[0].path).toBe('/products')
    expect(routes[0].method).toBe('put')
  })

  // delete

  it('should be create delete route.', () => {
    const appRouter = Router()
    appRouter.delete('/products', async (ctx) => {
      return ctx.response(200, [])
    })
    const routes = appRouter.getRoutes()

    expect(appRouter).toBeDefined()
    expect(routes).toBeDefined()
    expect(routes.length).toBeGreaterThan
    expect(routes[0].path).toBe('/products')
    expect(routes[0].method).toBe('delete')
  })

  // test server
  it('should be create server.', () => {
    const appServer = new AppServer()
    expect(appServer).toBeDefined()
  })

  it('should be register routes.', () => {
    const appServer = new AppServer()
    appServer.register()

    expect(appServer).toBeDefined()
  })
})
describe('AppRouter', () => {
  beforeEach(() => {})

  afterEach(() => {})

  it('should add a GET route', () => {
    const appRouter = Router()

    appRouter.get('/test', async (ctx) => ctx.response(200, 'GET'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('get')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a POST route', () => {
    const appRouter = Router()

    appRouter.post('/test', async (ctx) => ctx.response(200, 'POST'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('post')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a PUT route', () => {
    const appRouter = Router()

    appRouter.put('/test', async (ctx) => ctx.response(200, 'PUT'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('put')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a DELETE route', () => {
    const appRouter = Router()

    appRouter.delete('/test', async (ctx) => ctx.response(200, 'DELETE'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('delete')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a PATCH route', () => {
    const appRouter = Router()

    appRouter.patch('/test', async (ctx) => ctx.response(200, 'PATCH'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('patch')
    expect(routes[0].path).toBe('/test')
  })

  it('should return all routes', () => {
    const appRouter = Router()

    appRouter.get('/test1', async (ctx) => ctx.response(200, 'GET'))
    appRouter.post('/test2', async (ctx) => ctx.response(200, 'POST'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(2)
    expect(routes[0].path).toBe('/test1')
    expect(routes[1].path).toBe('/test2')
  })
})
describe('AppServer', () => {
  let appServer: AppServer

  beforeEach(() => {
    appServer = new AppServer()
  })

  it('should initialize express instance', () => {
    expect(appServer.instance).toBeDefined()
  })

  it('should register routes', () => {
    const appRouter = Router()
    appRouter.get('/test', async (ctx) => ctx.response(200, 'GET'))
    appServer.router(appRouter)
    expect(appServer.getRoutes()).toHaveLength(1)
  })

  it('should validate request body', async () => {
    const appRouter = Router()
    appRouter.post('/test', async (ctx) => ctx.response(200, 'POST'), {
      schema: {
        body: Type.Object({
          name: Type.String(),
        }),
      },
    })
    appServer.router(appRouter)
    const expressApp = appServer.register()

    const response = await supertest(expressApp).post('/test').send({ name: 'John Doe' }).expect(200)

    expect(response.text).toBe('POST')
  })

  it('should return validation error for invalid request body', async () => {
    const appRouter = Router()
    appRouter.post('/test', async (ctx) => ctx.response(200, 'POST'), {
      schema: {
        body: Type.Object({
          name: Type.String(),
        }),
      },
    })
    appServer.router(appRouter)
    const expressApp = appServer.register()

    const response = await supertest(expressApp).post('/test').send({ age: 30 }).expect(400)

    expect(response.body.desc).toBe('invalid_request')
  })

  it('should listen on specified port', (done) => {
    appServer.listen(3000, (err) => {
      expect(err).toBeUndefined()
      done()
    })
  })
})
describe('AppRouter', () => {
  let appRouter: AppRouter

  beforeEach(() => {
    appRouter = new AppRouter()
  })

  it('should add a GET route', () => {
    appRouter.get('/test', async (ctx) => ctx.response(200, 'GET'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('get')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a POST route', () => {
    appRouter.post('/test', async (ctx) => ctx.response(200, 'POST'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('post')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a PUT route', () => {
    appRouter.put('/test', async (ctx) => ctx.response(200, 'PUT'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('put')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a DELETE route', () => {
    appRouter.delete('/test', async (ctx) => ctx.response(200, 'DELETE'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('delete')
    expect(routes[0].path).toBe('/test')
  })

  it('should add a PATCH route', () => {
    appRouter.patch('/test', async (ctx) => ctx.response(200, 'PATCH'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].method).toBe('patch')
    expect(routes[0].path).toBe('/test')
  })

  it('should return all routes', () => {
    appRouter.get('/test1', async (ctx) => ctx.response(200, 'GET'))
    appRouter.post('/test2', async (ctx) => ctx.response(200, 'POST'))
    const routes = appRouter.getRoutes()
    expect(routes).toHaveLength(2)
    expect(routes[0].path).toBe('/test1')
    expect(routes[1].path).toBe('/test2')
  })
})

describe('AppServer', () => {
  let appServer: AppServer

  beforeEach(() => {
    appServer = new AppServer()
  })

  it('should initialize express instance', () => {
    expect(appServer.instance).toBeDefined()
  })

  it('should register routes', () => {
    const appRouter = Router()
    appRouter.get('/test', async (ctx) => ctx.response(200, 'GET'))
    appServer.router(appRouter)
    expect(appServer.getRoutes()).toHaveLength(1)
  })

  it('should validate request body', async () => {
    const appRouter = Router()
    appRouter.post('/test', async (ctx) => ctx.response(200, 'POST'), {
      schema: {
        body: Type.Object({
          name: Type.String(),
        }),
      },
    })
    appServer.router(appRouter)
    const expressApp = appServer.register()

    const response = await supertest(expressApp).post('/test').send({ name: 'John Doe' }).expect(200)

    expect(response.text).toBe('POST')
  })

  it('should return validation error for invalid request body', async () => {
    const appRouter = Router()
    appRouter.post('/test', async (ctx) => ctx.response(200, 'POST'), {
      schema: {
        body: Type.Object({
          name: Type.String(),
        }),
      },
    })
    appServer.router(appRouter)
    const expressApp = appServer.register()

    const response = await supertest(expressApp).post('/test').send({ age: 30 }).expect(400)

    expect(response.body.desc).toBe('invalid_request')
  })

  it('should listen on specified port', (done) => {
    appServer.listen(3001, (err) => {
      expect(err).toBeUndefined()
      done()
    })
  })
})
