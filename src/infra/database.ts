import { type Knex, knex as setupKnex } from 'knex'
import { env } from '../config'

export const config: Knex.Config = {
  client: 'pg',
  connection: env.PG_CONNECTION_STRING,
  migrations: {
    extension: 'ts',
    directory: './src/infra/database',
  },
}

export const knex = setupKnex(config)
