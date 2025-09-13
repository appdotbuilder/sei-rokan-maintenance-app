import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['operator', 'supervisor', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  role: userRoleSchema,
  full_name: z.string(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// User input schemas
export const createUserInputSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema,
  full_name: z.string().min(2),
  is_active: z.boolean().default(true)
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: userRoleSchema.optional(),
  full_name: z.string().min(2).optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Login schema
export const loginInputSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResponseSchema = z.object({
  user: userSchema.omit({ password_hash: true }),
  token: z.string()
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Master data schemas
export const afdelingSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Afdeling = z.infer<typeof afdelingSchema>;

export const createAfdelingInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true)
});

export type CreateAfdelingInput = z.infer<typeof createAfdelingInputSchema>;

export const blokSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  afdeling_id: z.number(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Blok = z.infer<typeof blokSchema>;

export const createBlokInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  afdeling_id: z.number(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true)
});

export type CreateBlokInput = z.infer<typeof createBlokInputSchema>;

export const satuanSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Satuan = z.infer<typeof satuanSchema>;

export const createSatuanInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true)
});

export type CreateSatuanInput = z.infer<typeof createSatuanInputSchema>;

// Maintenance type enum
export const maintenanceTypeSchema = z.enum(['tu', 'tbm', 'tm', 'pn', 'mn']);
export type MaintenanceType = z.infer<typeof maintenanceTypeSchema>;

// Maintenance status enum
export const maintenanceStatusSchema = z.enum(['draft', 'submitted', 'approved', 'rejected']);
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;

// Maintenance record schema (common for all maintenance types)
export const maintenanceRecordSchema = z.object({
  id: z.number(),
  maintenance_type: maintenanceTypeSchema,
  uraian_pekerjaan: z.string(),
  afdeling_id: z.number(),
  blok_id: z.number(),
  satuan_id: z.number(),
  tanggal: z.coerce.date(),
  status: maintenanceStatusSchema,
  created_by: z.number(),
  approved_by: z.number().nullable(),
  approved_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;

// Maintenance record input schemas
export const createMaintenanceRecordInputSchema = z.object({
  maintenance_type: maintenanceTypeSchema,
  uraian_pekerjaan: z.string().min(5),
  afdeling_id: z.number(),
  blok_id: z.number(),
  satuan_id: z.number(),
  tanggal: z.coerce.date(),
  status: maintenanceStatusSchema.default('draft')
});

export type CreateMaintenanceRecordInput = z.infer<typeof createMaintenanceRecordInputSchema>;

export const updateMaintenanceRecordInputSchema = z.object({
  id: z.number(),
  uraian_pekerjaan: z.string().min(5).optional(),
  afdeling_id: z.number().optional(),
  blok_id: z.number().optional(),
  satuan_id: z.number().optional(),
  tanggal: z.coerce.date().optional(),
  status: maintenanceStatusSchema.optional()
});

export type UpdateMaintenanceRecordInput = z.infer<typeof updateMaintenanceRecordInputSchema>;

export const approveMaintenanceRecordInputSchema = z.object({
  id: z.number(),
  approved: z.boolean()
});

export type ApproveMaintenanceRecordInput = z.infer<typeof approveMaintenanceRecordInputSchema>;

// Filter and search schemas
export const maintenanceFilterSchema = z.object({
  maintenance_type: maintenanceTypeSchema.optional(),
  afdeling_id: z.number().optional(),
  blok_id: z.number().optional(),
  status: maintenanceStatusSchema.optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search: z.string().optional()
});

export type MaintenanceFilter = z.infer<typeof maintenanceFilterSchema>;

// Dashboard summary schema
export const dashboardSummarySchema = z.object({
  total_records: z.number(),
  pending_approvals: z.number(),
  approved_records: z.number(),
  records_by_type: z.record(maintenanceTypeSchema, z.number()),
  records_by_afdeling: z.array(z.object({
    afdeling_name: z.string(),
    count: z.number()
  })),
  recent_activities: z.array(z.object({
    id: z.number(),
    maintenance_type: maintenanceTypeSchema,
    uraian_pekerjaan: z.string(),
    status: maintenanceStatusSchema,
    created_at: z.coerce.date()
  }))
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;