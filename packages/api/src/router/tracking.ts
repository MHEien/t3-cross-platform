import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "@acme/db";
import { 
  WindowActivity, 
  ApplicationUsage, 
  CreateWindowActivitySchema, 
  CreateApplicationUsageSchema 
} from "@acme/db/schema";
import { protectedProcedure } from "../trpc";

export const trackingRouter = {
  logWindowActivity: protectedProcedure
    .input(CreateWindowActivitySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(WindowActivity).values({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  logApplicationUsage: protectedProcedure
    .input(CreateApplicationUsageSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(ApplicationUsage).values({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getDailyApplicationUsage: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.ApplicationUsage.findMany({
        where: (usage, { eq, and }) => and(
          eq(usage.userId, ctx.session.user.id),
          eq(usage.date, input.date)
        ),
        orderBy: desc(ApplicationUsage.totalDuration),
      });
    }),

  getRecentWindowActivity: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.WindowActivity.findMany({
        where: eq(WindowActivity.userId, ctx.session.user.id),
        orderBy: desc(WindowActivity.startTime),
        limit: input.limit,
      });
    }),
} satisfies TRPCRouterRecord;