import {
  pgTable,
  text,
  timestamp,
  uuid,
  time,
  date,
} from 'drizzle-orm/pg-core';
import { id, timestamps } from './utils';

export const users = pgTable('users', {
  ...id,
  ...timestamps,
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('user'),
});

export const userDetails = pgTable('user_details', {
  ...id,
  ...timestamps,
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  contactPhoneNumber: text('contact_phone_number'),
  description: text('description'),
  contactEmail: text('contact_email'),
  jobTitle: text('job_title'),
});

export const credentials = pgTable('credentials', {
  ...id,
  ...timestamps,
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  password: text('password').notNull(),
});

export const createTokens = pgTable('create_tokens', {
  ...id,
  ...timestamps,
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createToken: text('create_token').notNull(),
  expiryDate: timestamp('expiry_date', {
    precision: 3,
    withTimezone: true,
  }).notNull(),
});

export const resetTokens = pgTable('reset_tokens', {
  ...id,
  ...timestamps,
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  resetToken: text('reset_token').notNull(),
  expiryDate: timestamp('expiry_date', {
    precision: 3,
    withTimezone: true,
  }).notNull(),
});

export const mechanics = pgTable('mechanics', {
  ...id,
  ...timestamps,
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  shiftStart: time('shift_start').notNull(),
  shiftEnd: time('shift_end').notNull(),
});

export const customers = pgTable('customers', {
  ...id,
  ...timestamps,
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number'),
});

export const vehicles = pgTable('vehicles', {
  ...id,
  ...timestamps,
  customerId: uuid('customer_id')
    .references(() => customers.id, { onDelete: 'cascade' })
    .notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: text('year').notNull(),
  vin: text('vin').notNull().unique(),
  registrationNumber: text('registration_number').notNull().unique(),
});

export const repairOrders = pgTable('repair_orders', {
  ...id,
  ...timestamps,
  description: text('description').notNull(),
  assignedMechanicId: uuid('assigned_mechanic_id').references(
    () => mechanics.id,
    { onDelete: 'set null' },
  ),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id, {
    onDelete: 'set null',
  }),
  startDate: text('start_time').notNull(),
  endDate: text('end_time').notNull(),
});
