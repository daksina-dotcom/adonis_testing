import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Admin from '#models/admin'

export default class extends BaseSeeder {
  async run() {
    // Create the Super Admin user
    const user = await User.create({
      email: 'admin@gmail.com',
      password: '$ecRe|-',
      isAdmin: true,
    })

    // Create the corresponding Admin table record
    await Admin.create({
      userId: user.id,
    })
  }
}
