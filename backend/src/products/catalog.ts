export interface Product {
  brand: string
  name: string
  model: string
  productCode?: string
  categoryIndex: number
  specifications: string[]
  keywords: string[]
}

// Verified examples only. Full 86-item catalog import follows in Phase 2.
// Price, warranty and stock are intentionally absent, not zero.
export const productExamples: Product[] = [
  {
    brand: 'W-KING',
    name: 'W-KING D220 Portable Speaker',
    model: 'D220',
    productCode: '10003120',
    categoryIndex: 1,
    specifications: ['40W stereo sound', 'Bluetooth 5.4', 'IPX7 waterproof rating', '4,500mAh battery', 'RGB lighting'],
    keywords: ['wking d220', 'w-king d220', 'bluetooth speaker d220', '10003120']
  },
  {
    brand: 'W-KING',
    name: 'W-KING D320 Speaker',
    model: 'D320',
    productCode: '10003121',
    categoryIndex: 1,
    specifications: ['40W omnidirectional audio', 'Bluetooth 5.3', 'IP67 dust and water resistance', 'RGB lighting'],
    keywords: ['wking d320', 'w-king d320', '10003121']
  },
  {
    brand: 'Winning Star',
    name: 'Winning Star Air Fryer 4.2L',
    model: 'ST-9696',
    categoryIndex: 3,
    specifications: ['4.2L capacity', '1,400W', 'Digital touchscreen', '10 preset cooking modes'],
    keywords: ['air fryer', 'airfryer', 'winning star st-9696']
  },
  {
    brand: 'R8',
    name: 'R8 Wireless Rechargeable Gaming Mouse',
    model: 'G300',
    productCode: '10003132',
    categoryIndex: 8,
    specifications: ['2.4GHz + Bluetooth dual-mode', 'Rechargeable battery', '7D controls', 'RGB lighting'],
    keywords: ['gaming mouse g300', 'r8 g300', '10003132']
  },
  {
    brand: 'FONENG',
    name: 'FONENG ANC Noise Cancelling Bluetooth Headset',
    model: 'BL59',
    categoryIndex: 9,
    specifications: ['Bluetooth 5.4', 'ANC noise cancellation', '40mm drivers', 'Up to 36 hours playback'],
    keywords: ['foneng bl59', 'anc headset', 'noise cancelling headset']
  }
]

export function searchProduct(input: string): Product | null {
  const query = input.trim().toLowerCase()
  if (!query) return null

  // Exact identifiers first. Avoid substring matches for short model names.
  const exact = productExamples.find(product =>
    [product.model, product.productCode, ...product.keywords]
      .some(value => value?.toLowerCase() === query)
  )
  if (exact) return exact

  if (query.length < 4) return null

  // Recognize model numbers embedded in natural-language questions:
  // "Do you have W-KING D220?" or "What's the ST-9696 price?"
  const inMessage = productExamples.find(product => {
    const escaped = product.model.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(query)
  })
  if (inMessage) return inMessage

  return productExamples.find(product =>
    [product.name, `${product.brand} ${product.model}`, ...product.keywords]
      .some(value => value.toLowerCase().includes(query))
  ) ?? null
}
