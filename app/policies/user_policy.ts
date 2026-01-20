import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
// Change to AuthorizationResponse if AuthorizerResponse is missing
import { AuthorizationResponse } from '@adonisjs/bouncer'

export default class UserPolicy extends BasePolicy {
  async update(
    user: User,
    targetUser: User,
    requestData?: any
  ): Promise<boolean | AuthorizationResponse> {
    if (requestData && 'isAdmin' in requestData && !user.isAdmin) {
      // The method .deny() remains the same
      return AuthorizationResponse.deny(
        'You are not allowed to change administrative privileges.',
        403
      )
    }

    return user.isAdmin || user.id === targetUser.id
  }

  async manage(user: User) {
    return !!user.isAdmin
  }

  async delete(user: User, targetUser?: User): Promise<boolean | AuthorizationResponse> {
    // 1. Only Admins can delete
    if (!user.isAdmin) {
      return AuthorizationResponse.deny('Only administrators can delete accounts.', 403)
    }

    // 2. Prevent an Admin from deleting their own account via this route
    if (targetUser && user.id === targetUser.id) {
      return AuthorizationResponse.deny('You cannot delete your own administrative account.', 403)
    }

    return true
  }
}
