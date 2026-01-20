import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as bouncerErrors } from '@adonisjs/bouncer'

console.log('This is in exceptions/handler.ts file')

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: any, ctx: HttpContext) {
    const stackLines = error.stack?.split('\n') || []
    const callerLine = stackLines[1] || ''
    const stackMatch = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) || 
                       callerLine.match(/at\s+()(.*):(\d+):(\d+)/)

    const debugInfo = this.debug ? {
      error_occurred_in: {
        function: stackMatch ? stackMatch[1] : 'Anonymous/Unknown',
        file: stackMatch ? stackMatch[2] : 'Unknown',
        line: stackMatch ? stackMatch[3] : 'Unknown',
        column: stackMatch ? stackMatch[4] : 'Unknown'
      },
      triggered_by: {
        method: ctx.request.method(),
        url: ctx.request.url(),
        route_pattern: ctx.route?.pattern || 'Unknown',
        controller_action: ctx.route?.handler || 'Unknown'
      },
      stack_tree: stackLines.slice(0, 5).map((line: string) => line.trim())
    } : undefined

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(error.status).send({
        status: error.status,
        code: 'BAD_REQUEST',
        message: 'Validation failed. Please check your input.',
        details: error.messages,
        debug_info: debugInfo
      })
    }

    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      return ctx.response.status(401).send({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'You need to be logged in to access this resource.',
        debug_info: debugInfo
      })
    }

    if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
      return ctx.response.status(404).send({
        status: 404,
        code: 'NOT_FOUND',
        message: 'The requested record was not found in our database.',
        debug_info: debugInfo
      })
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).send({
        status: 404,
        code: 'ROUTE_NOT_FOUND',
        message: 'The URL path you requested does not exist.',
        debug_info: debugInfo
      })
    }

    if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE) {
      return ctx.response.status(error.status).send({
        status: error.status,
        code: 'E_AUTHORIZATION_FAILURE',
        message: error.message,
        debug_info: debugInfo
      })
    }

    if (error.status === 403) {
      return ctx.response.status(403).send({
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
        debug_info: debugInfo
      })
    }

    const status = error.status || 500
    return ctx.response.status(status).send({
      status,
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred.',
      debug_info: debugInfo
    })
  }

  async report(error: any, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}