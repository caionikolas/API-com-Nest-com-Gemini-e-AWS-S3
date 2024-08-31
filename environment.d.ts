declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      GEMINI_API_KEY: string
      // PORT: number | 3333
    }
  }
}
