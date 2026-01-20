import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { loginValidator } from '#validators/user'
import JwtUtils from '#utils/jwt_utils'
console.log('THis is in controllers/auth_controller.ts file ')
export default class AuthController {
  async login({ request }: HttpContext) {
    const data = {
      ...request.all(),
      ...request.params(),
    }

    const { email, password } = await request.validateUsing(loginValidator, { data })

    const user = await User.findBy('email', email)
    if (!user) {
      return { message: 'Invalid credentials' }
    }

    const isPasswordValid = await hash.verify(user.password, password)
    if (!isPasswordValid) {
      return { message: 'Invalid credentials' }
    }

    // --- CUSTOM JWT LOGIC START ---
    const payload = { userId: user.id, email: user.email }

    const accessToken = JwtUtils.generateAccessToken(payload)
    const refreshToken = JwtUtils.generateRefreshToken(payload)
    // --- CUSTOM JWT LOGIC END ---

    return {
      message: 'Login successful',
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }

  async refresh({ request }: HttpContext) {
    const refreshToken = request.input('refresh_token')

    if (!refreshToken) {
      return { message: 'Refresh token is required' }
    }

    try {
      // 1. Verify the refresh token
      const payload = JwtUtils.verifyRefreshToken(refreshToken)

      // 2. (Optional but recommended) Check if user still exists in DB
      const user = await User.find(payload.userId)
      if (!user) {
        return { message: 'User no longer exists' }
      }

      // 3. Generate new tokens
      const newPayload = { userId: user.id, email: user.email }
      const accessToken = JwtUtils.generateAccessToken(newPayload)
      const newRefreshToken = JwtUtils.generateRefreshToken(newPayload)

      return {
        message: 'Token refreshed successfully',
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      return { message: 'Invalid or expired refresh token' }
    }
  }

  async logout({ auth_user }: HttpContext) {
    if (!auth_user) {
      return { message: 'Not authenticated' }
    }
    console.log(auth_user)
    return {
      message: 'Logged out successfully (Please clear your local tokens)',
    }
  }
}
