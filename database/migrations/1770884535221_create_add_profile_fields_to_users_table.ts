import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('firstname').nullable()
      table.string('lastname').nullable()
      table.integer('age').nullable()
      table.string('phone').nullable()
      table.string('gender').nullable()
      table.string('occupation').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
    table.dropColumn('firstname')
    table.dropColumn('lastname')
    table.dropColumn('age')
    table.dropColumn('phone')
    table.dropColumn('gender')
    table.dropColumn('occupation')
  })}
}
