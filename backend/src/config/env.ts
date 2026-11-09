import 'dotenv/config'

export const config = {
  enabled: process.env.BOT_ENABLED !== 'false',
  sessionDir: process.env.SESSION_DIR ?? './sessions/thi-local',
  logLevel: process.env.LOG_LEVEL ?? 'warn',
  supabaseUrl: process.env.SUPABASE_URL?.trim(),
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  allowedContacts: (process.env.BOT_ALLOWED_CONTACTS ?? '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}
