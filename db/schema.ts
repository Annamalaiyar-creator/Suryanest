import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const enquiries = sqliteTable('enquiries', {
 id: text('id').primaryKey(), kind: text('kind').notNull(),
 name: text('name').notNull(), email: text('email').notNull(), phone: text('phone').notNull(),
 payload: text('payload').notNull(), attachment: text('attachment'),
 ipHash: text('ip_hash').notNull(), createdAt: integer('created_at').notNull(),
});
