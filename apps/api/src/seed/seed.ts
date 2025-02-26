import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql as drizzleSql } from 'drizzle-orm/sql';

import type { DatabasePg } from '../common';
import {
  users,
  credentials,
  mechanics,
  customers,
  vehicles,
  repairOrders,
} from '../storage/schema';
import hashPassword from 'src/common/helpers/hashPassword';

dotenv.config({ path: './.env' });
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not found on .env');
}

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql) as DatabasePg;

export async function seedTruncateAllTables(db: DatabasePg): Promise<void> {
  await db.transaction(async (tx) => {
    const result = await tx.execute(drizzleSql`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `);

    const tables = (result as unknown as Record<string, unknown>[]).map(
      (row) => row.tablename as string,
    );

    await tx.execute(drizzleSql`SET CONSTRAINTS ALL DEFERRED`);

    for (const table of tables) {
      console.log(`Truncating table ${table}`);
      await tx.execute(
        drizzleSql`TRUNCATE TABLE ${drizzleSql.identifier(table)} CASCADE`,
      );
    }

    await tx.execute(drizzleSql`SET CONSTRAINTS ALL IMMEDIATE`);
  });
}

async function main() {
  try {
    await seedTruncateAllTables(db);

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

    const employeeUser = insertedUsers.find(
      (user) => user.email === 'user@example.com',
    );
    let insertedMechanics;
    if (employeeUser) {
      insertedMechanics = await db
        .insert(mechanics)
        .values({
          userId: employeeUser.id,
          shiftStart: '08:00:00',
          shiftEnd: '16:00:00',
        })
        .returning();
    }

    const insertedCustomers = await db
      .insert(customers)
      .values([
        {
          firstName: 'Jan',
          lastName: 'Kowalski',
          email: 'jan.kowalski@example.com',
          phoneNumber: '123456789',
        },
        {
          firstName: 'Anna',
          lastName: 'Nowak',
          email: 'anna.nowak@example.com',
          phoneNumber: '987654321',
        },
      ])
      .returning();

    const insertedVehicles = await db
      .insert(vehicles)
      .values([
        {
          customerId: insertedCustomers[0].id,
          make: 'Toyota',
          model: 'Corolla',
          year: '2015',
          vin: '1HGCM82633A004352',
          registrationNumber: 'XYZ1234',
        },
        {
          customerId: insertedCustomers[1].id,
          make: 'Honda',
          model: 'Civic',
          year: '2018',
          vin: '2HGCM82633A004353',
          registrationNumber: 'ABC5678',
        },
      ])
      .returning();

    await db
      .insert(repairOrders)
      .values([
        {
          description: 'Wymiana klocków hamulcowych',
          assignedMechanicId: insertedMechanics
            ? insertedMechanics[0].id
            : null,
          vehicleId: insertedVehicles[0].id,
        },
        {
          description: 'Naprawa silnika',
          assignedMechanicId: insertedMechanics
            ? insertedMechanics[0].id
            : null,
          vehicleId: insertedVehicles[1].id,
        },
      ])
      .returning();

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
