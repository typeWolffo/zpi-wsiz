import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
