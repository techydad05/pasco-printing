import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file first
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Then load environment variables based on NODE_ENV
loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    // Add SSL configuration to the database URL if using PostgreSQL
    databaseUrl: process.env.MEDUSA_DATABASE_URL,
    // SSL configuration is typically part of the connection string for PostgreSQL
    // e.g., postgres://user:password@host:port/database?sslmode=require
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    vite: () => {
      return {
        server: {
          allowedHosts: [".idevsites.com"],
        },
      };
    },
  },
});
