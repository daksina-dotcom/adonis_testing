import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ManualAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // 1. Try to get token from Header
    let token = ctx.request.header('Authorization')

    // 2. If no header, check Query Params (?token=) or Route Params (:token)
    if (!token) {
      const urlToken = ctx.request.input('token') || ctx.params.token
      if (urlToken) {
        token = `Bearer ${urlToken}`
        // Optional: Inject it back into headers so other parts of the app see it
        ctx.request.headers().authorization = token
      }
    }

    // 3. Validation check
    if (!token || !token.startsWith('Bearer ')) {
      return {
        message: 'Manual Auth: No token provided in Header or URL',
      }
    }

    return next()
  }
}
