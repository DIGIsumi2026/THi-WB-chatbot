import test from 'node:test'
import assert from 'node:assert/strict'
import { priceLabel, stockLabel, type CatalogProduct } from './product-service.js'

const sample: CatalogProduct = {
  id:'test', catalog_item_no:11, name:'W-KING D220', brand:'W-KING', category:'Speakers',
  model:'D220', product_code:'10003120', specifications:'40W speaker', source_page:11,
  image_url:null, price_lkr:null, price_verified_at:null, availability_status:'unverified'
}

test('unverified prices cannot be advertised', () => {
  assert.match(priceLabel(sample), /confirm/)
  assert.match(priceLabel({ ...sample,price_lkr:8000 }), /confirm/)
})

test('approved prices and stock statuses show correct labels', () => {
  assert.match(priceLabel({...sample,price_lkr:8000,price_verified_at:'2026-11-09T07:00:00Z'}), /8,000/)
  assert.match(stockLabel({...sample,availability_status:'limited'}), /Limited/)
})
