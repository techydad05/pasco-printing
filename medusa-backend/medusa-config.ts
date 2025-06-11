import { loadEnv, defineConfig } from "@medusajs/framework/utils";

console.log("MEDUSA_DATABASE_URL:", process.env.MEDUSA_DATABASE_URL);

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
