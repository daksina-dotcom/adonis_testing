import User from '#models/user'
import Admin from '#models/admin'
import { HttpContext } from '@adonisjs/core/http'
import { promoteOthers } from '#abilities/main'
console.log('THis is in controllers/admin_controller.ts file ')
export default class AdminController {
  async promote({ params, bouncer }: HttpContext) {
    await bouncer.authorize(promoteOthers)

    const userToPromote = await User.findOrFail(params.id)

    userToPromote.isAdmin = true
    await userToPromote.save()

    await Admin.firstOrCreate({ userId: userToPromote.id }, { userId: userToPromote.id })

    return { message: `${userToPromote.email} is now an admin` }
  }
}
