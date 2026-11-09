import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import { config } from '../config/env.js'
import { handleIncomingMessage } from './message-handler.js'

const logger = pino({ level: config.logLevel })
let reconnectAttempts = 0

export async function connectWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir)

  const socket = makeWASocket({
    auth: state,
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: false
  })

  // Preserve auth keys even as they rotate after initial pairing.
  socket.ev.on('creds.update', saveCreds)

  socket.ev.on('connection.update', ({ qr, connection, lastDisconnect }) => {
    if (qr) {
      console.log('\nScan this QR code using WhatsApp → Linked Devices → Link a device.\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      reconnectAttempts = 0
      console.log('✅ THi WhatsApp bot connected. Try sending: hi')
    }

    if (connection === 'close') {
      const status = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode

      if (status === DisconnectReason.loggedOut) {
        console.error('Session logged out. New pairing is required. Do not delete session data without backing it up.')
        return
      }

      reconnectAttempts += 1
      const delay = Math.min(30_000, 1_000 * 2 ** Math.min(reconnectAttempts, 5))
      console.warn(`WhatsApp connection closed (status ${status ?? 'unknown'}). Retry in ${delay / 1000}s.`)
      setTimeout(() => {
        void connectWhatsApp().catch(error => {
          console.error('Reconnect failed:', error)
        })
      }, delay)
    }
  })

  // Preserve ordering per chat. Multiple inbound messages can arrive together.
  const pendingByJid = new Map<string, Promise<void>>()
  socket.ev.on('messages.upsert', ({ type, messages }) => {
    if (type !== 'notify') return

    for (const message of messages) {
      const jid = message.key.remoteJid
      if (!jid) continue
      const previous = pendingByJid.get(jid) ?? Promise.resolve()
      const next = previous.catch(() => undefined).then(() =>
        handleIncomingMessage(socket, message)
      )
      pendingByJid.set(jid, next)
      void next.catch(error => console.error('Incoming message failed:', error))
        .finally(() => {
          if (pendingByJid.get(jid) === next) pendingByJid.delete(jid)
        })
    }
  })
}
