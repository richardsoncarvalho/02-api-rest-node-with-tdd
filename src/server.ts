import { app } from './app'
import { env } from './config'

void app.listen({ port: env.PORT }).then(() => {
  console.log('Server is running!')
})
