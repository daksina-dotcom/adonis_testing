import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const baseSchema = {
  name: vine.string().trim().minLength(3),

  email: vine
    .string()
    .trim()
    .email()
    .unique(async (db, value, field) => {
      const query = db.from('users').where('email', value)
      const userId = field.data.params?.id

      if (userId) {
        query.whereNot('id', userId)
      }

      // 3. Execute
      const user = await query.first()
      return !user
    }),
  password: vine.string().trim().minLength(8),
}

export const createUserValidator = vine.compile(
  vine.object({
    ...baseSchema,
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
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
    name: baseSchema.name.optional(),
    email: baseSchema.email.optional(),
    password: baseSchema.password.optional(),
  })
)

export const putUserValidator = vine.compile(
  vine.object({
    name: baseSchema.name.clone().nullable(),
    email: baseSchema.email.clone(),
    password: baseSchema.password.clone(),
  })
)

createUserValidator.messagesProvider = new SimpleMessagesProvider({
  'email.unique': 'This email address is already registered.',
  'email.email': 'Please provide a valid email address.',
  'password.minLength': 'Your password must be at least 8 characters long.',
})
