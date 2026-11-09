import type { WASocket, WAMessage } from '@whiskeysockets/baileys'
import { config } from '../config/env.js'
import { replyFor } from '../chatbot/router.js'

const processedMessageIds = new Set<string>()

function textFromMessage(message: WAMessage): string | null {
  const first = message.message
  const content = first?.ephemeralMessage?.message ?? first?.viewOnceMessage?.message ?? first
  return content?.conversation ?? content?.extendedTextMessage?.text ?? content?.imageMessage?.caption ?? null
}

function isAllowed(jid: string): boolean {
  if (!config.allowedContacts.length) return false // Safe default: don't reply to arbitrary personal chats.
  const value = jid.toLowerCase()
  const localPart = value.split('@')[0].replace(/\D/g,'')
  return config.allowedContacts.some(item => {
    const allowed = item.replace(/\D/g, '')
    return value === item || (allowed.length >= 8 && localPart === allowed)
  })
}

export async function handleIncomingMessage(socket: WASocket, message: WAMessage): Promise<void> {
  const jid = message.key.remoteJid
  if (!jid || message.key.fromMe) return
  if (jid.endsWith('@g.us') || jid.endsWith('@broadcast') || jid.endsWith('@newsletter')) return
  if (!message.message) return
  const text = textFromMessage(message)
  if (!text?.trim()) return

  if (!isAllowed(jid)) {
    // The identifier may end in @s.whatsapp.net or @lid; include its full value in BOT_ALLOWED_CONTACTS.
    console.log(`[THi Bot] Ignored non-allowlisted chat (${jid}). Add this JID to BOT_ALLOWED_CONTACTS only if it is a test account.`)
    return
  }

  const messageId = `${jid}:${message.key.id ?? ''}`
  if (processedMessageIds.has(messageId)) return
  processedMessageIds.add(messageId)
  if (processedMessageIds.size > 2000) processedMessageIds.clear()

  const reply = await replyFor(jid, text)
  if (reply.imageUrl) {
    try {
      await socket.sendMessage(jid, { image: { url: reply.imageUrl }, caption: reply.text })
      return
    } catch (error) {
      console.error('[Product image sending failed; falling back to text]', error)
    }
  }
  await socket.sendMessage(jid, { text: reply.text })
}
