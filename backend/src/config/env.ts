import 'dotenv/config'

export const config = {
  enabled: process.env.BOT_ENABLED !== 'false',
  sessionDir: process.env.SESSION_DIR ?? './sessions/thi-local',
  logLevel: process.env.LOG_LEVEL ?? 'warn'
}
