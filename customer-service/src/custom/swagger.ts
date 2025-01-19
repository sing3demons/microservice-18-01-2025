import * as swaggerJSDoc from 'swagger-jsdoc'

interface SwaggerSchema {
  openapi: string
  info: {
    title: string
    version: string
  }
  paths: Record<string, Record<string, any>>
  apis: string[]
  swaggerDefinition: swaggerJSDoc.SwaggerDefinition | undefined
}

export type AppSwagger = {
  path: string
  method: string
  detail?: SwaggerDetail
  body: Record<string, any>
  query: Record<string, any>
  params: Record<string, any>
  response: Record<string, any>
}

type TSwaggerObject = {
  name: string
  type: string
  required: boolean | false
  description?: string
}

type TResponses = {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean'
  properties?:
    | Record<string, { type: string; default?: string | number | object | []; nullable?: boolean }>
    | Record<string, TResponses>
    | Record<string, { type: string; properties: TResponses }>
  items?: TResponses | { type: string } | { type: string; properties: TResponses }
}

type IParameters = {
  in: 'path' | 'query'
  name: string
  schema: { type: string; enum?: string[]; default?: string | number | object | [] }
  required: boolean
}

type SwaggerDetail = {
  path?: string
  tags?: string[]
  summary?: string
  description?: string
  query?: IParameters[]
  body?: TSwaggerObject[]
  response?: {
    success?: TResponses
    'bad request'?: TResponses
    'internal server error'?: TResponses
  }
  params?: IParameters[]
}

export class SwaggerDoc {
  private swagger: SwaggerSchema = {
    info: { title: 'API Documentation', version: '1.0.0' },
    openapi: '3.0.0',
    paths: {},
    apis: [],
    swaggerDefinition: undefined,
  }
  constructor(options?: SwaggerSchema) {
    if (options?.info) {
      this.swagger.info = options.info
    }

    if (options?.openapi) {
      this.swagger.openapi = options.openapi
    }

    if (options?.apis) {
      this.swagger.apis = options.apis
    }

    if (options?.swaggerDefinition) {
      this.swagger.swaggerDefinition = options.swaggerDefinition
    }
  }
  apiDoc = (swaggerPath: AppSwagger[]) => {
    for (const endpoint of swaggerPath) {
      const { path, method, body, params, response, detail, query } = endpoint

      if (!this.swagger.paths[path]) {
        this.swagger.paths[path] = {}
      }

      const requestBody = detail?.body
        ? detail.body
        : Object.keys(body).length > 0
        ? {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: Object.fromEntries(Object.entries(body).map(([key, type]) => [key, { type }])),
                },
              },
            },
          }
        : undefined

      const responses = detail?.response
        ? {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
          schema: detail.response.success,
            },
          },
        },
        '400': {
          description: 'Bad Request',
          content: {
            'application/json': {
          schema: detail.response['bad request'],
            },
          },
        },
        '500': {
          description: 'Internal Server Error',
          content: {
            'application/json': {
          schema: detail.response['internal server error'],
            },
          },
        },
          }
        : {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
          schema: {
            type: 'object',
            properties: Object.fromEntries(Object.entries(response).map(([key, type]) => [key, { type }])),
          },
            },
          },
        },
        '400': {
          description: 'Bad Request',
        },
        '500': {
          description: 'Internal Server Error',
        },
          }

      const parameters = detail?.params
        ? detail?.params.map((param) => {
            return {
              name: param.name,
              in: param.in,
              required: param.required,
              schema: param.schema,
            }
          })
        : Object.entries(params).map(([key, type]) => ({
            name: key,
            in: 'path',
            required: true,
            schema: {
              type,
            },
          })) ||
          Object.entries(query).map(([key, type]) => ({
            name: key,
            in: 'query',
            required: false,
            schema: {
              type,
            },
          })) ||
          []

      this.swagger.paths[detail?.path || path][method] = {
        summary: detail?.summary || `${method.toUpperCase()} ${path}`,
        description: detail?.description,
        tags: detail?.tags || ['default'],
        requestBody,
        parameters,
        responses,
      }
    }

    const swaggerPaths: swaggerJSDoc.Options = {
      definition: {
        info: this.swagger.info,
        openapi: this.swagger.openapi,
        paths: this.swagger.paths,
      },
      apis: this.swagger.apis,
      swaggerDefinition: this.swagger.swaggerDefinition,
    }
    return swaggerPaths
  }
}
