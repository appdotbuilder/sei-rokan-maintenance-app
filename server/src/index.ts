import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  loginInputSchema,
  createUserInputSchema,
  updateUserInputSchema,
  createAfdelingInputSchema,
  createBlokInputSchema,
  createSatuanInputSchema,
  createMaintenanceRecordInputSchema,
  updateMaintenanceRecordInputSchema,
  approveMaintenanceRecordInputSchema,
  maintenanceFilterSchema,
  maintenanceTypeSchema
} from './schema';

// Import handlers
import { login, verifyToken } from './handlers/auth';
import { 
  createUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from './handlers/users';
import { 
  createAfdeling,
  getAfdelings,
  getAfdelingById,
  createBlok,
  getBloks,
  getBloksByAfdelingId,
  getBlokById,
  createSatuan,
  getSatuans,
  getSatuanById
} from './handlers/master-data';
import {
  createMaintenanceRecord,
  getMaintenanceRecords,
  getMaintenanceRecordsByType,
  getMaintenanceRecordById,
  updateMaintenanceRecord,
  approveMaintenanceRecord,
  deleteMaintenanceRecord,
  submitMaintenanceRecord
} from './handlers/maintenance';
import { getDashboardSummary } from './handlers/dashboard';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => login(input)),
    
    verifyToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => verifyToken(input.token)),
  }),

  // User management routes
  users: router({
    create: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    
    getAll: publicProcedure
      .query(() => getUsers()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id)),
    
    update: publicProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteUser(input.id)),
  }),

  // Master data routes
  masterData: router({
    // Afdeling routes
    afdeling: router({
      create: publicProcedure
        .input(createAfdelingInputSchema)
        .mutation(({ input }) => createAfdeling(input)),
      
      getAll: publicProcedure
        .query(() => getAfdelings()),
      
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => getAfdelingById(input.id)),
    }),

    // Blok routes
    blok: router({
      create: publicProcedure
        .input(createBlokInputSchema)
        .mutation(({ input }) => createBlok(input)),
      
      getAll: publicProcedure
        .query(() => getBloks()),
      
      getByAfdelingId: publicProcedure
        .input(z.object({ afdelingId: z.number() }))
        .query(({ input }) => getBloksByAfdelingId(input.afdelingId)),
      
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => getBlokById(input.id)),
    }),

    // Satuan routes
    satuan: router({
      create: publicProcedure
        .input(createSatuanInputSchema)
        .mutation(({ input }) => createSatuan(input)),
      
      getAll: publicProcedure
        .query(() => getSatuans()),
      
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => getSatuanById(input.id)),
    }),
  }),

  // Maintenance routes
  maintenance: router({
    create: publicProcedure
      .input(createMaintenanceRecordInputSchema)
      .mutation(({ input }) => createMaintenanceRecord(input, 1)), // TODO: Get userId from context
    
    getAll: publicProcedure
      .input(maintenanceFilterSchema.optional())
      .query(({ input }) => getMaintenanceRecords(input)),
    
    getByType: publicProcedure
      .input(z.object({ 
        type: maintenanceTypeSchema,
        filter: maintenanceFilterSchema.optional()
      }))
      .query(({ input }) => getMaintenanceRecordsByType(input.type, input.filter)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMaintenanceRecordById(input.id)),
    
    update: publicProcedure
      .input(updateMaintenanceRecordInputSchema)
      .mutation(({ input }) => updateMaintenanceRecord(input, 1)), // TODO: Get userId from context
    
    approve: publicProcedure
      .input(approveMaintenanceRecordInputSchema)
      .mutation(({ input }) => approveMaintenanceRecord(input, 1)), // TODO: Get userId from context
    
    submit: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => submitMaintenanceRecord(input.id, 1)), // TODO: Get userId from context
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteMaintenanceRecord(input.id, 1)), // TODO: Get userId from context
  }),

  // Dashboard routes
  dashboard: router({
    getSummary: publicProcedure
      .query(() => getDashboardSummary()),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();