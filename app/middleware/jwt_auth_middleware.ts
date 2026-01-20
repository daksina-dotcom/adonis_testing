import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import JwtService from '#services/jwt_service'
import { inject } from '@adonisjs/core'
console.log('THis is in middleware/jwt_auth_middleware.ts file ')
@inject()
export default class JwtAuthMiddleware {
  constructor(protected jwtService: JwtService) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { message: 'Missing or invalid token' }
    }

    const token = authHeader.split(' ')[1]

    try {
      const user = await this.jwtService.authenticateRequest(token)
      // Attach the user to the context so controllers can access it via ctx.auth_user
      ctx.auth_user = user
      return next()
    } catch (error) {
      return { message: error.message }
    }
  }
}
