export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  env: import.meta.env.VITE_ENV || "development",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}
