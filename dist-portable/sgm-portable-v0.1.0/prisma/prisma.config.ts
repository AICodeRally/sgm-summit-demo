/**
 * Prisma Configuration (Prisma 7+)
 *
 * CRITICAL: Schema isolation for sgm_summit_demo
 * Both URLs MUST include: &schema=sgm_summit_demo
 */

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DATABASE_URL_DIRECT,
    },
  },
};
