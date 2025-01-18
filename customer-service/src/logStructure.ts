import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import os from 'os'

export interface ICustomLogger {
  Invoke: string
  Event: string
  Protocol?: string
  Type: string
  RawData?: any
  Data?: any
  ResTime?: string
}

interface ILogDetail {
  LogType: string
  Host: string
  AppName: string
  Instance: number
  Session: string
  InitInvoke: string
  Scenario: string | null
  InputTimeStamp: string
  OutputTimeStamp: string | null
  Custom?: ICustomLogger
  ProcessingTime: string | null
}

interface LogStructure {
  // message: string;
  start_time: number
  end_time?: number
  session_id?: string
  transaction_id: string
  request: {
    ip: string
    method: string
    url: {
      path: string
      params?: Record<string, unknown>
      query?: Record<string, unknown>
      body?: Record<string, unknown>
    }
  }
  custom?: {
    node: string
    cmd: string
    invoke: string
    rawData: string
    data: any
    protocol?: string
    protocolMethod?: string
  }
  response?: {
    status_code: number
    time: number
  }
}

class CustomLogger {
  logger: ILogDetail

  constructor(req: Request) {
    this.logger = {
      LogType: 'INFO',
      Host: os.hostname(),
      AppName: 'customer-service',
      Instance: process.pid,
      Session: (req.headers['session-id'] as string) || uuidv4(),
      InitInvoke: '',
      Scenario: '',
      InputTimeStamp: new Date().toISOString(),
      OutputTimeStamp: null,
      ProcessingTime: null,
    }
  }

  public New(scenario: string) {
    this.logger.Scenario = scenario
    this.logger.InitInvoke = `${scenario}.${uuidv4()}`
    return this
  }

  public addDetail(node: string, cmd: string, invoke: string, rawData: string, data: any, method?: string) {
    this.logger.Custom = {
      Event: `${node}.${cmd}`,
      Invoke: invoke,
      Type: 'Request',
      RawData: rawData,
      Data: data,
      Protocol: method ? `http.${method}` : undefined,
      ResTime:
        new Date().getTime() -
        new Date(this.logger.OutputTimeStamp ? this.logger.OutputTimeStamp : this.logger.InputTimeStamp).getTime() +
        'ms',
    }
    this.logger.ProcessingTime = new Date().toISOString()
    this.logger.OutputTimeStamp = new Date().toISOString()

    const log = this.logger
    process.stdout.write(JSON.stringify(log) + os.EOL)

    // this.logger.Custom
    delete this.logger.Custom
    this.logger.ProcessingTime = null
    return this
  }

  public end() {
    this.logger = null as unknown as ILogDetail
  }
}

declare global {
  namespace Express {
    interface Request {
      logger: CustomLogger
    }
  }
}

function mLogger(req: Request, res: Response, next: Function) {
  const logger = new CustomLogger(req)
  req.logger = logger

  next()
  res.on('finish', () => req.logger.end())
}

export { mLogger }

type ContainsWhitespace<T extends string> = T extends
  | `${string} ${string}`
  | `${string}\t${string}`
  | `${string}\n${string}`
  ? 'Error: Strings containing whitespace are not allowed'
  : T

function checkValueStrict<T extends string | number>(value: T extends string ? ContainsWhitespace<T> : T): void {}

checkValueStrict('') // Error: Space is not allowed
