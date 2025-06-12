// cypress.config.ts
import { defineConfig } from 'cypress'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  // aquí va la ruta correcta a tu .env
  path: path.resolve(__dirname, '../tech-farming-backend/.env'),
})

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      return config
    },
    env: {
      USERNAME_TEST: process.env['CYPRESS_USERNAME_TEST'],
      PASSWORD_TEST: process.env['CYPRESS_PASSWORD_TEST'],
    },
  },
})
