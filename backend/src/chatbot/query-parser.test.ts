import test from 'node:test'
import assert from 'node:assert/strict'
import { parseProductQuery } from './query-parser.js'

test('natural-language Bluetooth speaker request maps to product type', () => {
  assert.equal(parseProductQuery('Do you have bluetooth speakers?').query, 'bluetooth speaker')
})

test('exact model number is extracted from price questions', () => {
  assert.deepEqual(parseProductQuery('How much is the D220?'), { query: 'd220', intent: 'price' })
})

test('gaming mouse and air fryer searches retain their meaning', () => {
  assert.equal(parseProductQuery('I need a gaming mouse').query, 'gaming mouse')
  assert.equal(parseProductQuery('Show me air fryers').query, 'air fryer')
})

test('TV size can be searched without numeric navigation', () => {
  assert.equal(parseProductQuery('Show me a 43 inch TV').query, '43 inch tv')
})
