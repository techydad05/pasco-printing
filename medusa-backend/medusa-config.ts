import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file first
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Then load environment variables based on NODE_ENV
loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.MEDUSA_DATABASE_URL,
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
