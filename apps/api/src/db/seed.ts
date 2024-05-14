import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'
import kleur from 'kleur'

import { db } from './connection.js'
import {
  accounts,
  invites,
  members,
  organizations,
  projects,
  tokens,
  users,
} from './schema/index.js'

async function seed() {
  /**
   * Reset database
   */

  await db.delete(members)
  await db.delete(projects)
  await db.delete(organizations)
  await db.delete(tokens)
  await db.delete(invites)
  await db.delete(accounts)
  await db.delete(users)
  console.log(kleur.yellow('✔ Database reset'))

  /**
   * Create users
   */

  const passwordHash = await hash('123456', 1)

  const [user, anotherUser, anotherUser2] = await db
    .insert(users)
    .values([
      {
        name: 'Reinaldo',
        email: 'contato@reinaldodev.com.br',
        avatarUrl: 'https://github.com/reinaldocs.png',
        passwordHash,
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash,
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        passwordHash,
      },
    ])
    .returning()

  console.log(kleur.yellow('✔ Users created'))

  /**
   * Create organizations
   */

  const [organizationsAdmin] = await db
    .insert(organizations)
    .values({
      name: 'Acme Inc (Admin)',
      slug: 'acme-admin',
      domain: 'acme.com.br',
      ownerId: user.id,
      shouldAttachUsersByDomain: true,
      avatarUrl: faker.image.avatarGitHub(),
    })
    .returning()

  const [organizationsMember] = await db
    .insert(organizations)
    .values({
      name: 'Acme Inc (Member)',
      slug: 'acme-member',
      ownerId: user.id,
      shouldAttachUsersByDomain: true,
      avatarUrl: faker.image.avatarGitHub(),
    })
    .returning()

  const [organizationsBilling] = await db
    .insert(organizations)
    .values({
      name: 'Acme Inc (Billing)',
      slug: 'acme-billing',
      ownerId: user.id,
      shouldAttachUsersByDomain: true,
      avatarUrl: faker.image.avatarGitHub(),
    })
    .returning()

  console.log(kleur.yellow('✔ Organizations created'))

  /**
   * Create members
   */

  await db.insert(members).values([
    {
      organizationId: organizationsAdmin.id,
      userId: user.id,
      role: 'ADMIN',
    },
    {
      organizationId: organizationsAdmin.id,
      userId: anotherUser.id,
      role: 'MEMBER',
    },
    {
      organizationId: organizationsAdmin.id,
      userId: anotherUser2.id,
      role: 'MEMBER',
    },
  ])

  await db.insert(members).values([
    {
      organizationId: organizationsMember.id,
      userId: user.id,
      role: 'MEMBER',
    },
    {
      organizationId: organizationsMember.id,
      userId: anotherUser.id,
      role: 'ADMIN',
    },
    {
      organizationId: organizationsMember.id,
      userId: anotherUser2.id,
      role: 'MEMBER',
    },
  ])

  await db.insert(members).values([
    {
      organizationId: organizationsBilling.id,
      userId: user.id,
      role: 'BILLING',
    },
    {
      organizationId: organizationsBilling.id,
      userId: anotherUser.id,
      role: 'MEMBER',
    },
    {
      organizationId: organizationsBilling.id,
      userId: anotherUser2.id,
      role: 'ADMIN',
    },
  ])

  console.log(kleur.yellow('✔ Members created'))

  /**
   * Create projects
   */

  await db.insert(projects).values([
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsAdmin.id,
    },
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsAdmin.id,
    },
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsAdmin.id,
    },
  ])

  await db.insert(projects).values([
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsMember.id,
    },
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsMember.id,
    },
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsMember.id,
    },
  ])

  await db.insert(projects).values([
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsBilling.id,
    },
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsBilling.id,
    },
    {
      name: faker.lorem.word(5),
      slug: faker.lorem.slug(5),
      description: faker.lorem.paragraph(),
      avatarUrl: faker.image.avatarGitHub(),
      ownerId: faker.helpers.arrayElement([
        user.id,
        anotherUser.id,
        anotherUser2.id,
      ]),
      organization: organizationsBilling.id,
    },
  ])

  console.log(kleur.yellow('✔ Projects created'))
}

seed().then(() => {
  console.log(kleur.green('✔ Finished'))
  process.exit(0)
})
