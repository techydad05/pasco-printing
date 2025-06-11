import { loadEnv, defineConfig } from "@medusajs/framework/utils";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file first
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Then load environment variables based on NODE_ENV
loadEnv(process.env.NODE_ENV || "development", process.cwd());

// Log all environment variables for debugging
console.log("Environment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MEDUSA_DATABASE_URL:", process.env.MEDUSA_DATABASE_URL);
console.log("STORE_CORS:", process.env.STORE_CORS);
console.log("ADMIN_CORS:", process.env.ADMIN_CORS);
console.log("AUTH_CORS:", process.env.AUTH_CORS);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "[REDACTED]" : "undefined");
console.log("COOKIE_SECRET:", process.env.COOKIE_SECRET ? "[REDACTED]" : "undefined");
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
