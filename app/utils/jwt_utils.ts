import jwt from 'jsonwebtoken'
import env from '#start/env'
console.log('THis is in utils/jwt_utils.ts file ')
const ACCESS_TOKEN_SECRET = env.get('JWT_ACCESS_SECRET', 'access_secret')
const REFRESH_TOKEN_SECRET = env.get('JWT_REFRESH_SECRET', 'refresh_secret')

export default class JwtUtils {
  static generateAccessToken(payload: object) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  }

  static generateRefreshToken(payload: object) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
  }

  static verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as any
    } catch (error) {
      return error.message
    }
  }

  static verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as any
    } catch (error) {
      return error.message
    }
  }
}
