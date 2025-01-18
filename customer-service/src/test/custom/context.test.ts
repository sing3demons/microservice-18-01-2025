import { Static, TObject } from '@sinclair/typebox'
import {
  Context,
  CtxSchema,
  GetPathParameter,
  HTTPHeaders,
  ResolvePath,
  statusMap,
  InvertedStatusMap,
  CookieOptions,
  Cookie,
  Redirect,
  RouteHandler,
  HttpMethod,
  InlineHandler,
  MiddlewareRoute,
  InternalRoute,
} from '../../custom/context'

describe('Context Types', () => {
  it('should resolve path parameters correctly', () => {
    type Path = '/users/:userId/posts/:postId'
    type Params = ResolvePath<Path>
    const params: Params = {
      userId: '123',
      postId: '456',
    }
    expect(params.userId).toBe('123')
    expect(params.postId).toBe('456')
  })

  it('should handle optional path parameters', () => {
    type Path = '/users/:userId/posts/:postId?'
    type Params = ResolvePath<Path>
    const params: Params = {
      userId: '123',
    }
    expect(params.userId).toBe('123')
    expect(params.postId).toBeUndefined()
  })

  it('should map status codes correctly', () => {
    expect(statusMap.OK).toBe(200)
    expect(InvertedStatusMap[200]).toBe('OK')
  })

  it('should handle HTTP headers correctly', () => {
    const headers: HTTPHeaders = {
      'content-type': 'application/json',
      'x-powered-by': 'Elysia',
    }
    expect(headers['content-type']).toBe('application/json')
    expect(headers['x-powered-by']).toBe('Elysia')
  })

  it('should handle context correctly', () => {
    const context: Context = {
      body: {},
      query: {},
      params: {},
      headers: {},
      redirect: jest.fn(),
      set: {
        headers: {},
        status: 200,
        cookie: {},
      },
      response: jest.fn(),
      path: '/test',
      route: '/test',
    }

    expect(context.path).toBe('/test')
    expect(context.route).toBe('/test')
  })

  it('should handle route handler correctly', async () => {
    const handler: RouteHandler = async (context) => {
      return { message: 'Hello, world!' }
    }
    const context: Context = {
      body: {},
      query: {},
      params: {},
      headers: {},
      redirect: jest.fn(),
      set: {
        headers: {},
        status: 200,
        cookie: {},
      },
      response: jest.fn(),
      path: '/test',
      route: '/test',
     }
    const result = await handler(context)
    expect(result).toEqual({ message: 'Hello, world!' })
  })
})
