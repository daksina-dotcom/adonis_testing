import vine, { SimpleMessagesProvider } from '@vinejs/vine'
console.log('THis is in validators/user.ts file ')

const uniqueEmailRule = async (db: any, value: string, field: any) => {
  const query = db.from('users').where('email', value)
  const userId = field.data.params?.id || field.data?.id
  if (userId) {
    query.whereNot('id', userId)
  }
  const user = await query.first()
  return !user
}
const nameSchema = vine.string().trim().minLength(3)
const emailSchema = vine.string().trim().email().unique(uniqueEmailRule)
const passwordSchema = vine.string().trim().minLength(8)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)

export const idParamValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)

export const createUserValidator = vine.compile(
  vine.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
)

export const bulkCreateValidator = vine.compile(
  vine.object({
    users: vine
      .array(
        vine.object({
          name: nameSchema,
          email: emailSchema,
          password: passwordSchema,
        })
      )
      .notEmpty()
      .minLength(1)
      .maxLength(50),
  })
)

export const bulkUpdateValidator = vine.compile(
  vine.object({
    users: vine
      .array(
        vine.object({
          id: vine.number().exists({ table: 'users', column: 'id' }),
          name: vine.string().trim().minLength(3).optional(),
          email: vine.string().trim().email().unique(uniqueEmailRule).optional(),
          password: vine.string().trim().minLength(8).optional(),
        })
      )
      .notEmpty(),
  })
)

export const bulkDeleteValidator = vine.compile(
  vine.object({
    ids: vine.array(vine.number().exists({ table: 'users', column: 'id' })).notEmpty(),
  })
)

export const showUserValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number().exists({ table: 'users', column: 'id' }),
    }),
  })
)

export const patchUserValidator = vine.compile(
  vine.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
  })
)

export const putUserValidator = vine.compile(
  vine.object({
    name: nameSchema.optional(),
    email: emailSchema,
    password: passwordSchema,
  })
)

export const userQueryValidator = vine.compile(
  vine.object({
    search: vine.string().trim().optional(),
    isAdmin: vine.boolean().optional(),
    sortBy: vine.enum(['id', 'name', 'email', 'createdAt']).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)

const messages = {
  'email.unique': 'This email address is already registered.',
  'email.email': 'Please provide a valid email address.',
  'password.minLength': 'Your password must be at least 8 characters long.',
  'name.minLength': 'Name must be at least 3 characters.',
}

createUserValidator.messagesProvider = new SimpleMessagesProvider(messages)
patchUserValidator.messagesProvider = new SimpleMessagesProvider(messages)
putUserValidator.messagesProvider = new SimpleMessagesProvider(messages)
bulkCreateValidator.messagesProvider = new SimpleMessagesProvider(messages)
bulkUpdateValidator.messagesProvider = new SimpleMessagesProvider(messages)
