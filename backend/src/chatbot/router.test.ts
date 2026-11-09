import test from 'node:test'
import assert from 'node:assert/strict'
import { replyFor } from './router.js'

test('shows THi welcome menu and no delivery', () => {
  const reply = replyFor('test1@s.whatsapp.net', 'hi')
  assert.match(reply, /THi Tech Showroom/)
  assert.match(reply, /showroom collection only/i)
})

test('supports category navigation', () => {
  const jid = 'test2@s.whatsapp.net'
  replyFor(jid, 'menu')
  assert.match(replyFor(jid, '1'), /Browse THi Categories/)
  assert.match(replyFor(jid, '3'), /ST-9696/)
})

test('finds model number inside a natural question', () => {
  assert.match(replyFor('test3@s.whatsapp.net', 'Do you have W-KING D220?'), /10003120/)
})

test('does not invent prices or accept purchase in phase 1', () => {
  const jid = 'test4@s.whatsapp.net'
  assert.match(replyFor(jid, 'ST-9696'), /Pending showroom verification/)
  assert.match(replyFor(jid, '3'), /not recording purchase requests yet/i)
})
