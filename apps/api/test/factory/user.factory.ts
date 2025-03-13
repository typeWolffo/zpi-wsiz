import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { v4 as uuidv4 } from 'uuid';

import { users, credentials } from '../../src/storage/schema';
import { USER_ROLES } from '../../src/user/schemas/userRoles';

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { DatabasePg } from 'src/common';

type User = InferSelectModel<typeof users>;
export type UserWithCredentials = User & { credentials?: Credential };
type Credential = InferInsertModel<typeof credentials>;

// Dostosowane do struktury danych projektu
export const credentialFactory = Factory.define<Credential>(() => ({
  id: uuidv4(),
  userId: uuidv4(),
  password: 'password123', // domyślne hasło do testów
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

class UserFactory extends Factory<UserWithCredentials> {
  withCredentials(credential: { password: string }) {
    return this.associations({
      credentials: credentialFactory.build(credential),
    });
  }

  withRole(role: string) {
    return this.params({
      role: role,
    });
  }
}

export const createUserFactory = (db: DatabasePg) => {
  return UserFactory.define(({ onCreate, associations, transientParams }) => {
    onCreate(async (user) => {
      const [inserted] = await db.insert(users).values(user).returning();

      if (associations.credentials) {
        const [insertedCredential] = await db
          .insert(credentials)
          .values({
            ...associations.credentials,
            // Możesz potrzebować funkcji hashowania hasła tutaj
            password: associations.credentials.password,
            userId: inserted.id,
          })
          .returning();

        return {
          ...inserted,
          credentials: {
            ...insertedCredential,
            password: associations.credentials.password,
          },
        };
      }

      return inserted;
    });

    return {
      id: uuidv4(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
      role: transientParams.role || USER_ROLES.EMPLOYEE,
    };
  });
};
