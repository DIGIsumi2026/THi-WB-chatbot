import type { WASocket, WAMessage } from '@whiskeysockets/baileys'
import { replyFor } from '../chatbot/router.js'

// The process-local cache prevents immediate repeated replies, but does not
// provide durable duplicate protection. Phase 3 uses the database for that.
const processedMessageIds = new Set<string>()

function textFromMessage(message: WAMessage): string | null {
  const first = message.message
  const content = first?.ephemeralMessage?.message ??
    first?.viewOnceMessage?.message ??
    first

  return content?.conversation ??
    content?.extendedTextMessage?.text ??
    content?.imageMessage?.caption ??
    null
}

export async function handleIncomingMessage(socket: WASocket, message: WAMessage): Promise<void> {
  const jid = message.key.remoteJid
  if (!jid || message.key.fromMe) return
  if (jid.endsWith('@g.us') || jid.endsWith('@broadcast') || jid.endsWith('@newsletter')) return
  if (!message.message) return

  const text = textFromMessage(message)
  if (!text?.trim()) return

  const messageId = `${jid}:${message.key.id ?? ''}`
  if (processedMessageIds.has(messageId)) return
  processedMessageIds.add(messageId)
  if (processedMessageIds.size > 2000) processedMessageIds.clear()

  const reply = replyFor(jid, text)
  await socket.sendMessage(jid, { text: reply })
}
