import { policies } from '#policies/main'
import * as abilities from '#abilities/main'
import User from '#models/user'
import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
console.log('THis is in middleware/initialize_bouncer_middleware.ts file ')
/**
 * Init bouncer middleware is used to create a bouncer instance
 * during an HTTP request
 */
export default class InitializeBouncerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Create bouncer instance for the ongoing HTTP request.
     * We will pull the user from the HTTP context.
     */

    console.log('Bouncer User:', ctx.auth_user?.email, 'isAdmin:', ctx.auth_user?.isAdmin)
    ctx.bouncer = new Bouncer(
      () => ctx.auth_user || null,
      abilities,
      policies
    ).setContainerResolver(ctx.containerResolver)

    /**
     * Share bouncer helpers with Edge templates.
     */
    // if ('view' in ctx) {
    //   ctx.view.share(ctx.bouncer.edgeHelpers)
    // }

    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    bouncer: Bouncer<User, typeof abilities, typeof policies>
  }
}
