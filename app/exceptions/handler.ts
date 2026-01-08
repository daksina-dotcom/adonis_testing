import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: any, ctx: HttpContext) {

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(error.status).send({
        status: error.status,
        code: 'BAD_REQUEST',
        message: 'Validation failed. Please check your input.',
        details: error.messages,
      })
    }

    if (error instanceof authErrors.E_UNAUTHORIZED_ACCESS) {
      return ctx.response.status(401).send({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'You need to be logged in to access this resource.',
        error: error.message // The "real" underlying error
      })
    }

    if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
      return ctx.response.status(404).send({
        status: 404,
        code: 'NOT_FOUND',
        message: 'The requested record was not found in our database.',
      })
    }

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).send({
        status: 404,
        code: 'ROUTE_NOT_FOUND',
        message: 'The URL path you requested does not exist.',
      })
    }

    if (error.status === 403) {
      return ctx.response.status(403).send({
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
      })
    }

    const status = error.status || 500
    return ctx.response.status(status).send({
      status,
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      // Only show stack/real error in dev mode
      error: this.debug ? error.message : undefined,
      stack: this.debug ? error.stack : undefined,
    })
  }

  async report(error: any, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}