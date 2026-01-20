import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['name'], 'users_name_index')
      // Note: 'email' is already unique, which creates an index automatically.
      // But adding a standard index for 'LIKE' queries can still be helpful.
      table.index(['email'], 'users_email_index')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['name'], 'users_name_index')
      table.dropIndex(['email'], 'users_email_index')
    })
  }
}
