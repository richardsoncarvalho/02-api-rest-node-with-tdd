import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { transactionsRoutes } from './routes/transactionsRoutes'

export const app = fastify()

void app.register(cookie)

void app.register(transactionsRoutes, {
  prefix: 'transactions',
})
