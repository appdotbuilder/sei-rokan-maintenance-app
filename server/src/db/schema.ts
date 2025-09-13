import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  boolean, 
  integer,
  pgEnum,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['operator', 'supervisor', 'admin']);
export const maintenanceTypeEnum = pgEnum('maintenance_type', ['tu', 'tbm', 'tm', 'pn', 'mn']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['draft', 'submitted', 'approved', 'rejected']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  full_name: text('full_name').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Master data tables
export const afdelingTable = pgTable('afdeling', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const blokTable = pgTable('blok', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  afdeling_id: integer('afdeling_id').notNull().references(() => afdelingTable.id),
  description: text('description'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  uniqueBlokPerAfdeling: unique().on(table.afdeling_id, table.code)
}));

export const satuanTable = pgTable('satuan', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Maintenance records table
export const maintenanceRecordsTable = pgTable('maintenance_records', {
  id: serial('id').primaryKey(),
  maintenance_type: maintenanceTypeEnum('maintenance_type').notNull(),
  uraian_pekerjaan: text('uraian_pekerjaan').notNull(),
  afdeling_id: integer('afdeling_id').notNull().references(() => afdelingTable.id),
  blok_id: integer('blok_id').notNull().references(() => blokTable.id),
  satuan_id: integer('satuan_id').notNull().references(() => satuanTable.id),
  tanggal: timestamp('tanggal').notNull(),
  status: maintenanceStatusEnum('status').notNull().default('draft'),
  created_by: integer('created_by').notNull().references(() => usersTable.id),
  approved_by: integer('approved_by').references(() => usersTable.id),
  approved_at: timestamp('approved_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  createdMaintenanceRecords: many(maintenanceRecordsTable, { relationName: 'creator' }),
  approvedMaintenanceRecords: many(maintenanceRecordsTable, { relationName: 'approver' })
}));

export const afdelingRelations = relations(afdelingTable, ({ many }) => ({
  bloks: many(blokTable),
  maintenanceRecords: many(maintenanceRecordsTable)
}));

export const blokRelations = relations(blokTable, ({ one, many }) => ({
  afdeling: one(afdelingTable, {
    fields: [blokTable.afdeling_id],
    references: [afdelingTable.id]
  }),
  maintenanceRecords: many(maintenanceRecordsTable)
}));

export const satuanRelations = relations(satuanTable, ({ many }) => ({
  maintenanceRecords: many(maintenanceRecordsTable)
}));

export const maintenanceRecordsRelations = relations(maintenanceRecordsTable, ({ one }) => ({
  afdeling: one(afdelingTable, {
    fields: [maintenanceRecordsTable.afdeling_id],
    references: [afdelingTable.id]
  }),
  blok: one(blokTable, {
    fields: [maintenanceRecordsTable.blok_id],
    references: [blokTable.id]
  }),
  satuan: one(satuanTable, {
    fields: [maintenanceRecordsTable.satuan_id],
    references: [satuanTable.id]
  }),
  creator: one(usersTable, {
    fields: [maintenanceRecordsTable.created_by],
    references: [usersTable.id],
    relationName: 'creator'
  }),
  approver: one(usersTable, {
    fields: [maintenanceRecordsTable.approved_by],
    references: [usersTable.id],
    relationName: 'approver'
  })
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Afdeling = typeof afdelingTable.$inferSelect;
export type NewAfdeling = typeof afdelingTable.$inferInsert;

export type Blok = typeof blokTable.$inferSelect;
export type NewBlok = typeof blokTable.$inferInsert;

export type Satuan = typeof satuanTable.$inferSelect;
export type NewSatuan = typeof satuanTable.$inferInsert;

export type MaintenanceRecord = typeof maintenanceRecordsTable.$inferSelect;
export type NewMaintenanceRecord = typeof maintenanceRecordsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  afdeling: afdelingTable,
  blok: blokTable,
  satuan: satuanTable,
  maintenanceRecords: maintenanceRecordsTable
};