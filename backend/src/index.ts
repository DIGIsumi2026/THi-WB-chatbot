import { config } from './config/env.js'
import { connectWhatsApp } from './whatsapp/connection.js'

if (!config.enabled) {
  console.log('BOT_ENABLED=false; WhatsApp bot not started.')
} else {
  console.log('Starting THi WhatsApp chatbot (local development)...')
  connectWhatsApp().catch(error => {
    console.error('Startup failed:', error)
    process.exitCode = 1
  })
}
