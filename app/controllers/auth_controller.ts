import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { loginValidator } from '#validators/user'

export default class AuthController {
async login({ request, response }: HttpContext) {
  const data = {
    ...request.all(),      // Gets Body + Query String (?email=)
    ...request.params(),   // Gets Route Params (:email)
  }
  const { email, password } = await request.validateUsing(loginValidator,{data})

  const user = await User.findBy('email', email)
  if (!user) return response.unauthorized({ message: 'User not found' })

  const isPasswordValid = await hash.verify(user.password, password)
  if (!isPasswordValid) return response.unauthorized({ message: 'Password match failed' })

  const token = await User.accessTokens.create(user)

  return response.ok({
    message: 'Login successful',
    token: token.value!.release(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  })
}
async logout({ request, response }: HttpContext) {
  const authHeader = request.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.badRequest({ message: 'No token provided' })
  }

  const tokenValue = authHeader.replace('Bearer ', '').trim()

  try {
    const decodedToken = AccessToken.decode('oat_', tokenValue)
    
    if (!decodedToken) {
      return response.unauthorized({ message: 'Invalid token format' })
    }

const deletedRows = (await db
  .from('auth_access_tokens')
  .where('id', decodedToken.identifier)
  .delete()) as unknown as number

if (deletedRows === 0) {
  return response.notFound({ message: 'Token not found or already deleted' })
}

    return response.ok({
      message: 'Logged out successfully. Token removed from database.'
    })
  } catch (error) {
    return response.internalServerError({ 
      message: 'Logout failed', 
      error: error.message 
    })
  }
}
}
