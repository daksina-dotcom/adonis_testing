import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const UsersController = () => import('#controllers/users_controller')
const AuthController = () => import('#controllers/auth_controller')

router
  .get('/', async () => {
    return 'Welcome User'
  })
  .as('root')

router.post('/login', [AuthController, 'login']).as('login')
router.get('/login/:email?/:password?', [AuthController, 'login'])
  .where('email', {
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
// Update this line in your routes.ts
router.get('/logout', [AuthController, 'logout']) // Changed from .post to .get
  .use([
    middleware.manualAuth(),
    middleware.auth({
      guards: ['api'],
    })
  ])
router
  .post('/logout', [AuthController, 'logout'])
  .use([
    middleware.manualAuth(),
    middleware.auth({
      guards: ['api'],
    })
  ])
  .as('logout')

router.post('/signup', [UsersController, 'store']).as('signup')
router.get('/signup', [UsersController, 'store'])

router
  .group(() => {
    router.get('/', [UsersController, 'index']).as('details')

    router.get('/:id', [UsersController, 'show']).as('specific')

    router.put('/:id', [UsersController, 'update']).as('change')

    router.patch('/:id', [UsersController, 'update']).as('modified')

    router.delete('/:id', [UsersController, 'destroy']).as('delete')
  })
  .prefix('/users')
  .where('id', router.matchers.number())
  .as('users')
  
  .use([
    middleware.manualAuth(),
    middleware.auth({
      guards: ['api'],
    })
  ])
