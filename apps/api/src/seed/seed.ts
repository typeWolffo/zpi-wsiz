import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { DatabasePg } from '../common';
import { users, credentials } from '../storage/schema';
import hashPassword from 'src/common/helpers/hashPassword';

dotenv.config({ path: './.env' });
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not found on .env');
}

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql) as DatabasePg;

async function main() {
  try {
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
        },
        {
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'User',
          role: 'employee',
        },
      ])
      .returning();

    const credentialsData = await Promise.all(
      insertedUsers.map(async (user) => ({
        userId: user.id,
        password: await hashPassword('password'),
      })),
    );

    await db.insert(credentials).values(credentialsData);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await sql.end();
    console.log('Database connection closed');
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('An error occurred:', error);
      process.exit(1);
    });
}
