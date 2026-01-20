import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const UsersController = () => import('#controllers/users_controller')
const AuthController = () => import('#controllers/auth_controller')
const AdminController = () => import('#controllers/admin_controller')
console.log('THis is in start/routes.ts file ')
router
  .get('/', async () => {
    return 'Welcome User'
  })
  .as('root')

router.post('/login', [AuthController, 'login']).as('login')
router.get('/login/:email?/:password?', [AuthController, 'login']).as('login.get')

router.get('/logout', [AuthController, 'logout']).use([middleware.jwtAuth()]).as('logout.get')
router.post('/logout', [AuthController, 'logout']).use([middleware.jwtAuth()]).as('logout')

router.post('/refresh', [AuthController, 'refresh']).as('auth.refresh')

router.post('/signup', [UsersController, 'createUser']).as('signup')
router.get('/signup', [UsersController, 'createUser'])

router
  .group(() => {
    router
      .group(() => {
        router.delete('/:id', [UsersController, 'deleteUser']).as('delete')
        router.post('/bulk/delete', [UsersController, 'bulkDelete']).as('bulk.delete')
      })
      .use([middleware.jwtAuth(), middleware.bouncer()])

    router.post('/bulk', [UsersController, 'bulkCreate']).as('bulk.create')

    router.put('/bulk', [UsersController, 'bulkUpdate']).as('bulk.update')

    router.get('/', [UsersController, 'getAllUsers']).as('details')

    router.get('/:id', [UsersController, 'getUser']).as('specific')

    router.put('/:id', [UsersController, 'updateUser']).as('change')

    router.patch('/:id', [UsersController, 'updateUser']).as('modified')
  })
  .prefix('/users')
  .as('users')

  .use([middleware.jwtAuth()])

router
  .post('/admin/promote/:id', [AdminController, 'promote'])
  .use([middleware.jwtAuth(), middleware.bouncer()])
  .as('admin.promote')

// router.resource('users', UsersController)
// .as('users')
// .use('*',[
//   middleware.jwtAuth(),
//   middleware.auth({
//     guards: ['api'],
//   })
// ])
