import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { authenticateWithPassword } from './routes/auth/authenticade-with-password'
import { createAccount } from './routes/auth/create-account'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)

app.register(fastifyJwt, {
  secret: 'MY_JWT_SECRET',
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'NextJS SaaS API',
      description:
        'Full-stack SaaS with multi-tenant & RBAC API documentation.',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

// Colocar rotas depois da configuração do Swagger
app.register(createAccount)
app.register(authenticateWithPassword)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server listening port 3333')
})
