import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import {
  createUserValidator,
  showUserValidator,
  idParamValidator,
  putUserValidator,
  patchUserValidator,
  bulkCreateValidator,
  bulkUpdateValidator,
  bulkDeleteValidator,
  userQueryValidator,
} from '#validators/user'
import UserPolicy from '#policies/user_policy'
import db from '@adonisjs/lucid/services/db'
interface ApiResponse<T = any> {
  status: boolean
  message: string
  receivedData?: T
}

interface PaginatedResponse<T> {
  meta: any
  data: T[]
}
console.log('THis is in controllers/users_controller.ts file ')
export default class UsersController {

async getAllUsers({ request }: HttpContext): Promise<PaginatedResponse<User>> {
  const { search, isAdmin, sortBy, order } = await request.validateUsing(userQueryValidator)

  const query = User.query()
  if (search) {
    query.where((q) => {
      q.where('name', 'like', `%${search}%`)
       .orWhere('email', 'like', `%${search}%`)
    })
  }
  if (isAdmin !== undefined) {
    query.where('isAdmin', isAdmin)
  }
  const sortColumn = sortBy || 'createdAt'
  const sortOrder = order || 'desc'
  query.orderBy(sortColumn, sortOrder)
  const result = await query.paginate(request.input('page', 1), 10)
  return result.toJSON() as PaginatedResponse<User>
}

  async createUser({ request }: HttpContext): Promise<ApiResponse<User>> {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)
    return {
      status: true,
      message: 'User Created Successfully',
      receivedData: user,
    }
  }

  async bulkCreate({ request }: HttpContext): Promise<ApiResponse<User[]>> {
    const payload = await request.validateUsing(bulkCreateValidator)
    return await db.transaction(async (trx) => {
      const users = await User.createMany(payload.users, { client: trx })
      return {
        status: true,
        message: `${users.length} Users Created Successfully`,
        receivedData: users,
      }
    })
  }

  async getUser({ params }: HttpContext): Promise<User> {
    const payload = await showUserValidator.validate({ params })
    const user = await User.findOrFail(payload.params.id)
    // const user = await User.findByOrFail('id',payload.params.id)
    return user
  }

  async updateUser({ params, request, bouncer }: HttpContext):Promise<ApiResponse<User>> {
    console.log('This is in update function at controllers/users_controller.ts file')
    const validator = request.method() === 'PUT' ? putUserValidator : patchUserValidator
    const payload = await request.validateUsing(validator, { data: { ...request.all(), params } })
    const targetUser = await User.findOrFail(params.id)
    await bouncer.with(UserPolicy).authorize('update', targetUser, payload)
    targetUser.merge(payload)
    await targetUser.save()

    return {
      status: true,
      message: `User with Id ${params.id} has been updated successfully.`,
      receivedData: targetUser,
    }
  }

  async bulkUpdate({ request, bouncer }: HttpContext): Promise<ApiResponse<User[]>> {
    const payload = await request.validateUsing(bulkUpdateValidator)
    await bouncer.with(UserPolicy).authorize('manage')
    return await db.transaction(async (trx) => {
      const users = await User.updateOrCreateMany('id', payload.users, {
        client: trx,
      })

      return {
        status: true,
        message: `${users.length} users processed successfully.`,
        receivedData: users,
      }
    })
  }

  async deleteUser({ request, params, bouncer }: HttpContext): Promise<ApiResponse> {
    await request.validateUsing(idParamValidator, { data: { params } })
    const user = await User.findOrFail(params.id)
    await bouncer.with(UserPolicy).authorize('delete', user)
    await user.delete()
    return {
      status: true,
      message: `User with Id ${params.id} has been deleted successfully.`,
    }
  }

  async bulkDelete({ request, response, bouncer }: HttpContext): Promise<ApiResponse | void> {
    const payload = await request.validateUsing(bulkDeleteValidator)
    await bouncer.with('UserPolicy').authorize('delete')
    const affectedRows = (await User.query()
      .whereIn('id', payload.ids)
      .delete()) as unknown as number

    if (affectedRows === 0) {
      return response.notFound({ message: 'No users found with the provided IDs' })
    }

    return {
      status: true,
      message: `Successfully deleted ${affectedRows} users.`,
    }
  }
}
