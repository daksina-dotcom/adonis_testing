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

  @column({ serializeAs: null }) 
  declare password: string

  @column()
  declare firstname: string | null

  @column()
  declare lastname: string | null

  @column()
  declare age: number | null

  @column()
  declare phone: string | null

  @column()
  declare gender: string | null

  @column()
  declare occupation: string | null

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
