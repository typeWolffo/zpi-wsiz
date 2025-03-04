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
          email: 'mechanic1@example.com',
          firstName: 'Jan',
          lastName: 'Kowalczyk',
          role: 'employee',
        },
        {
          email: 'mechanic2@example.com',
          firstName: 'Piotr',
          lastName: 'Nowicki',
          role: 'employee',
        },
        {
          email: 'manager@example.com',
          firstName: 'Maria',
          lastName: 'Wiśniewska',
          role: 'manager',
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

    const employeeUsers = insertedUsers.filter(
      (user) => user.role === 'employee',
    );

    const insertedMechanics = await db
      .insert(mechanics)
      .values([
        {
          userId: employeeUsers[0].id,
          shiftStart: '08:00:00',
          shiftEnd: '16:00:00',
        },
        {
          userId: employeeUsers[1].id,
          shiftStart: '10:00:00',
          shiftEnd: '18:00:00',
        },
        {
          userId: insertedUsers[0].id, // Admin user as a part-time mechanic
          shiftStart: '09:00:00',
          shiftEnd: '13:00:00',
        },
      ])
      .returning();

    // Insert 3 customers
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
        {
          firstName: 'Tomasz',
          lastName: 'Wiśniewski',
          email: 'tomasz.wisniewski@example.com',
          phoneNumber: '555666777',
        },
      ])
      .returning();

    // Insert 3 vehicles per customer (9 total)
    const insertedVehicles = await db
      .insert(vehicles)
      .values([
        // Customer 1 vehicles
        {
          customerId: insertedCustomers[0].id,
          make: 'Toyota',
          model: 'Corolla',
          year: '2015',
          vin: '1HGCM82633A004352',
          registrationNumber: 'XYZ1234',
        },
        {
          customerId: insertedCustomers[0].id,
          make: 'Ford',
          model: 'Focus',
          year: '2017',
          vin: '2FGCM82633A004353',
          registrationNumber: 'ABC5678',
        },
        {
          customerId: insertedCustomers[0].id,
          make: 'Volkswagen',
          model: 'Golf',
          year: '2019',
          vin: '3VWCM82633A004354',
          registrationNumber: 'DEF9012',
        },
        // Customer 2 vehicles
        {
          customerId: insertedCustomers[1].id,
          make: 'Honda',
          model: 'Civic',
          year: '2018',
          vin: '4HGCM82633A004355',
          registrationNumber: 'GHI3456',
        },
        {
          customerId: insertedCustomers[1].id,
          make: 'Mazda',
          model: 'CX-5',
          year: '2020',
          vin: '5MZCM82633A004356',
          registrationNumber: 'JKL7890',
        },
        {
          customerId: insertedCustomers[1].id,
          make: 'BMW',
          model: '3 Series',
          year: '2016',
          vin: '6BMCM82633A004357',
          registrationNumber: 'MNO1234',
        },
        // Customer 3 vehicles
        {
          customerId: insertedCustomers[2].id,
          make: 'Audi',
          model: 'A4',
          year: '2019',
          vin: '7AUCM82633A004358',
          registrationNumber: 'PQR5678',
        },
        {
          customerId: insertedCustomers[2].id,
          make: 'Mercedes',
          model: 'C-Class',
          year: '2021',
          vin: '8MBCM82633A004359',
          registrationNumber: 'STU9012',
        },
        {
          customerId: insertedCustomers[2].id,
          make: 'Hyundai',
          model: 'Tucson',
          year: '2017',
          vin: '9HYCM82633A004360',
          registrationNumber: 'VWX3456',
        },
      ])
      .returning();

    interface ScheduleEntry {
      start: Date;
      end: Date;
    }

    interface MechanicSchedule {
      [mechanicId: string]: ScheduleEntry[];
    }

    const mechanicSchedule: MechanicSchedule = {};
    insertedMechanics.forEach((mechanic) => {
      mechanicSchedule[mechanic.id] = [];
    });

    const generateDateRange = (mechanicId: string) => {
      const today = new Date();

      for (let attempts = 0; attempts < 20; attempts++) {
        const randomDayOffset = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const randomDay = new Date(today);
        randomDay.setDate(today.getDate() + randomDayOffset);

        randomDay.setHours(0, 0, 0, 0);

        const startHour = Math.floor(Math.random() * 10) + 7; // 7-16
        const startMinute = Math.floor(Math.random() * 60); // 0-59

        const startDate = new Date(randomDay);
        startDate.setHours(startHour, startMinute, 0, 0);

        const maxPossibleDuration = Math.min(2, 18 - startHour);
        const durationHours = Math.max(
          1,
          Math.floor(Math.random() * (maxPossibleDuration + 1)),
        );

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + durationHours);

        const hasOverlap = mechanicSchedule[mechanicId].some((schedule) => {
          return startDate < schedule.end && endDate > schedule.start;
        });

        if (!hasOverlap) {
          mechanicSchedule[mechanicId].push({
            start: startDate,
            end: endDate,
          });

          const formatDateTime = (date: Date) => {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;
          };

          return {
            startDate: formatDateTime(startDate),
            endDate: formatDateTime(endDate),
          };
        }
      }

      const fallbackDay = new Date(today);
      fallbackDay.setDate(
        today.getDate() + mechanicSchedule[mechanicId].length,
      );
      fallbackDay.setHours(8, 0, 0, 0);
      const fallbackEndDay = new Date(fallbackDay);
      fallbackEndDay.setHours(10, 0, 0, 0);

      mechanicSchedule[mechanicId].push({
        start: fallbackDay,
        end: fallbackEndDay,
      });

      return {
        startDate: `${fallbackDay.getFullYear()}-${String(fallbackDay.getMonth() + 1).padStart(2, '0')}-${String(fallbackDay.getDate()).padStart(2, '0')} 08:00:00`,
        endDate: `${fallbackDay.getFullYear()}-${String(fallbackDay.getMonth() + 1).padStart(2, '0')}-${String(fallbackDay.getDate()).padStart(2, '0')} 10:00:00`,
      };
    };

    await db
      .insert(repairOrders)
      .values([
        {
          description: 'Wymiana klocków hamulcowych',
          assignedMechanicId: insertedMechanics[0].id,
          vehicleId: insertedVehicles[0].id,
          ...generateDateRange(insertedMechanics[0].id),
        },
        {
          description: 'Wymiana oleju i filtrów',
          assignedMechanicId: insertedMechanics[0].id,
          vehicleId: insertedVehicles[3].id,
          ...generateDateRange(insertedMechanics[0].id),
        },
        {
          description: 'Diagnostyka komputerowa',
          assignedMechanicId: insertedMechanics[0].id,
          vehicleId: insertedVehicles[6].id,
          ...generateDateRange(insertedMechanics[0].id),
        },
        {
          description: 'Naprawa silnika',
          assignedMechanicId: insertedMechanics[1].id,
          vehicleId: insertedVehicles[1].id,
          ...generateDateRange(insertedMechanics[1].id),
        },
        {
          description: 'Wymiana rozrządu',
          assignedMechanicId: insertedMechanics[1].id,
          vehicleId: insertedVehicles[4].id,
          ...generateDateRange(insertedMechanics[1].id),
        },
        {
          description: 'Naprawa układu wydechowego',
          assignedMechanicId: insertedMechanics[1].id,
          vehicleId: insertedVehicles[7].id,
          ...generateDateRange(insertedMechanics[1].id),
        },
        {
          description: 'Wymiana świec zapłonowych',
          assignedMechanicId: insertedMechanics[2].id,
          vehicleId: insertedVehicles[2].id,
          ...generateDateRange(insertedMechanics[2].id),
        },
        {
          description: 'Wymiana płynu chłodniczego',
          assignedMechanicId: insertedMechanics[2].id,
          vehicleId: insertedVehicles[5].id,
          ...generateDateRange(insertedMechanics[2].id),
        },
        {
          description: 'Kontrola i regulacja zbieżności kół',
          assignedMechanicId: insertedMechanics[2].id,
          vehicleId: insertedVehicles[8].id,
          ...generateDateRange(insertedMechanics[2].id),
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
