import { env } from '@saas/env'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { db } from '@/db/connection'
import { accounts, users } from '@/db/schema'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/github',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with Github',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const githubOauthURL = new URL(
        'https://github.com/login/oauth/access_token',
      )

      githubOauthURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
      githubOauthURL.searchParams.set(
        'client_secret',
        env.GITHUB_OAUTH_CLIENT_SECRET,
      )
      githubOauthURL.searchParams.set(
        'redirect_uri',
        env.GITHUB_OAUTH_REDIRECT_URI,
      )
      githubOauthURL.searchParams.set('code', code)

      // https://github.com/login/oauth/authorize?client_id=Ov23liTCvLBtFqUEpr5t&redirect_uri=http://localhost:3000/api/auth/callback&scope=user:email
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // Erro  de certificado
      const githubAccessTokenResponse = await fetch(githubOauthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })
      const githubAccessTokenData = await githubAccessTokenResponse.json()

      const { access_token: githubAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAccessTokenData)

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
        },
      })
      const githubUserData = await githubUserResponse.json()

      const {
        id: githubId,
        name,
        email,
        avatar_url: avatarUrl,
      } = z
        .object({
          id: z.number().int().transform(String),
          avatar_url: z.string().url(),
          name: z.string().nullable(),
          email: z.string().nullable(),
        })
        .parse(githubUserData)

      console.log(githubUserData)

      if (!email) {
        throw new BadRequestError(
          'Your Github account must have an email to authenticate.',
        )
      }

      const [findUser] = await db
        .select({
          id: users.id,
        })
        .from(users)
        .where(eq(users.email, email))

      let user = findUser

      if (!user) {
        const [createUser] = await db
          .insert(users)
          .values({
            email,
            name,
            avatarUrl,
          })
          .returning({
            id: users.id,
          })

        user = createUser
      }

      const [findAccount] = await db
        .select({
          id: accounts.id,
        })
        .from(accounts)
        .where(
          and(eq(accounts.userId, user.id), eq(accounts.provider, 'GITHUB')),
        )

      if (!findAccount) {
        await db.insert(accounts).values({
          userId: user.id,
          provider: 'GITHUB',
          providerAccountId: githubId,
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
