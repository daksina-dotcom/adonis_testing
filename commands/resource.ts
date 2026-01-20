import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class Resource extends BaseCommand {
  static commandName = 'resource'
  static description = 'Shortcut for creating User-related controllers, models and migrations.'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Name Of the Resource' })
  declare name: string

  async run() {
    this.logger.info(`Building resource stack for: ${this.name}`)
    try {
      await this.kernel.exec('make:controller', [this.name, '--resource', '--singular'])
      this.logger.success('Controller created')

      await this.kernel.exec('make:model', [this.name, '--migration'])
      this.logger.success('Model and Migration created')
      this.logger.info(`Next: Register the singular resource in start/routes.ts:`)
      this.logger.info(
        `router.resource('${this.name.toLowerCase()}', '#controllers/${this.name.toLowerCase()}s_controller').singular()`
      )
    } catch (e) {
      this.logger.error('Failed to create resource stack')
      console.error(e)
    }
  }
}
