import User from '#models/user'
import JwtUtils from '#utils/jwt_utils'
console.log('THis is in services/jwt_service.ts file ')
export default class JwtService {
  async authenticateRequest(token: string) {
    const payload = JwtUtils.verifyAccessToken(token)
    console.log(payload)
    if (!payload || !payload.userId) {
      throw new Error('Invalid or expired token')
    }
    
    const user = await User.find(payload.userId)
    console.log(user)
    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}
