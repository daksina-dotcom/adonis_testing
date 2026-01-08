import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { putUserValidator, patchUserValidator } from '#validators/user'
import { createUserValidator } from '#validators/user'
import { showUserValidator } from '#validators/user'

export default class UsersController {
  async index({}: HttpContext) {
    const users = await User.all()
    return users
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)
    return response.created({
      message: 'User Created Successfully',
      receivedData: user,
    })
  }

  async show({ params }: HttpContext) {
    
    const payload = await showUserValidator.validate({params});
    const user = await User.findOrFail(payload.params.id)
    return user
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const validator = request.method() === 'PUT' ? putUserValidator : patchUserValidator

    const payload = await request.validateUsing(validator as any)

    user.merge(payload)
    await user.save()

    return response.ok({
      message: `User with Id ${params.id} has been updated successfully.`,
      userId: params.id,
      receivedData: user,
    })
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await user.delete()

    return response.ok({
      message: `User with Id ${params.id} has been deleted successfully.`,
    })
  }
}
