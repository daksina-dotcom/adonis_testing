import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add the boolean column. Default to false so
      // existing users don't accidentally become admins.
      table.boolean('is_admin').defaultTo(false).after('password')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // This allows you to "undo" the change later if needed
      table.dropColumn('is_admin')
    })
  }
}
