import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import JwtService from '#services/jwt_service'
import { inject } from '@adonisjs/core'
console.log('THis is in middleware/jwt_auth_middleware.ts file ')
@inject()
export default class JwtAuthMiddleware {
  constructor(protected jwtService: JwtService) {}

// middleware/jwt_auth_middleware.ts
async handle(ctx: HttpContext, next: NextFn) {
  // Check the raw headers and cookies first
  console.log('--- JWT Middleware Check ---')
  console.log('Authorization Header:', ctx.request.header('authorization'))

  let token = ctx.request.header('authorization')?.split(' ')[1]

  if (!token) {
    token = ctx.request.cookie('auth_token')
    console.log('Token found in cookie:', token ? 'Yes' : 'No')
  } else {
    console.log('Token found in header: Yes')
  }

  if (!token) {
    console.error('Final Result: No token identified')
    return ctx.response.unauthorized({ message: 'No token found' })
  }

// middleware/jwt_auth_middleware.ts
try {
  const user = await this.jwtService.authenticateRequest(token)
  
  if (!user) {
    throw new Error('User not found after decryption')
  }

  ctx.auth_user = user

  
  return next()
} catch (error) {
  console.error('CRITICAL MIDDLEWARE ERROR:', error) // This prints to your VS Code / Terminal
  
  return ctx.response.unauthorized({ 
    message: 'Invalid token', 
    // Fallback to a string if error.name is missing
    code: error.name || 'UNKNOWN_ERROR',
    detail: error.message 
  })
}
}
}
