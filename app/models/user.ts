import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
console.log('THis is in models/user.ts file ')
export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null }) // Still hide this in JSON
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare isAdmin: boolean

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @beforeSave()
  public static async hashedPassword(user: User) {
    if (user.$dirty.password && !user.password.startsWith('$scrypt')) {
      user.password = await hash.make(user.password)
    }
  }
}
