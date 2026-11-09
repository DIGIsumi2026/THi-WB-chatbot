import { CATEGORY_MENU, CATEGORIES, MAIN_MENU, SHOWROOM_INFO } from './menu.js'
import { productExamples, searchProduct, type Product } from '../products/catalog.js'

type Mode = 'main' | 'categories' | 'search' | 'product'
interface ChatState {
  mode: Mode
  product?: Product
}

// Phase 1 only: short-lived local state. Phase 3 will store it in PostgreSQL.
const states = new Map<string, ChatState>()
const stateFor = (jid: string): ChatState => states.get(jid) ?? { mode: 'main' }

function productReply(product: Product): string {
  const specs = product.specifications.map(value => `• ${value}`).join('\n')
  return `📦 *${product.name}*\n` +
    `Brand: ${product.brand}\n` +
    `Model: ${product.model}\n` +
    (product.productCode ? `Code: ${product.productCode}\n` : '') +
    `\n${specs}\n\n` +
    `💰 Price: Pending showroom verification\n` +
    `📦 Stock: Pending showroom verification\n\n` +
    `1. Price Inquiry\n2. Availability Inquiry\n3. Purchase Inquiry\n4. Main Menu`
}

export function replyFor(jid: string, text: string): string {
  const input = text.trim()
  const normalized = input.toLowerCase().replace(/\s+/g, ' ')
  const current = stateFor(jid)

  if (!input || input.length > 400) {
    return 'Please send a short product name, model number, or type MENU.'
  }

  if (['hi', 'hello', 'hey', 'start', 'menu', 'home', 'cancel', '0'].includes(normalized)) {
    states.set(jid, { mode: 'main' })
    return MAIN_MENU
  }

  if (/\bdelivery\b|\bshipping\b/.test(normalized)) {
    return 'THi currently offers *showroom collection only*. Delivery is not available.\n\nType MENU for other options.'
  }

  // Any chat state supports direct model searches.
  const found = searchProduct(input)
  if (found) {
    states.set(jid, { mode: 'product', product: found })
    return productReply(found)
  }

  if (current.mode === 'product' && current.product && /^[1-4]$/.test(normalized)) {
    const product = current.product
    if (normalized === '4') {
      states.set(jid, { mode: 'main' })
      return MAIN_MENU
    }
    const topic = normalized === '1' ? 'price' : normalized === '2' ? 'stock availability' : 'purchase'
    return `Thanks for your interest in *${product.name}*.\n` +
      `A ${topic} request workflow will be connected to the admin dashboard in the next development phases.\n` +
      `We are not recording purchase requests yet.\n\n` +
      `For now, contact the showroom at +94 70 709 0909 or type MENU.`
  }

  if (current.mode === 'search') {
    return `We couldn't find "${input}" in this starter's five sample products.\n` +
      `The full catalog will be imported in Phase 2.\n\n` +
      `Try D220, D320, ST-9696, G300 or BL59; type MENU to restart.`
  }

  if (current.mode === 'categories' && /^[1-9]$/.test(normalized)) {
    const index = Number(normalized)
    const examples = productExamples.filter(product => product.categoryIndex === index)
    if (!examples.length) {
      return `*${CATEGORIES[index - 1]}*\n\n` +
        `Products in this category will be searchable after the full catalog import.\n\nType MENU to start again.`
    }
    return `*${CATEGORIES[index - 1]}*\n\n` +
      examples.map((product, i) => `${i + 1}. ${product.name} (${product.model})`).join('\n') +
      '\n\nType a product model to view specifications, or MENU.'
  }

  if (current.mode === 'main') {
    switch (normalized) {
      case '1':
        states.set(jid, { mode: 'categories' })
        return CATEGORY_MENU
      case '2':
        states.set(jid, { mode: 'search' })
        return '🔎 Type a product model number or name.\n\nExamples: D220, ST-9696, BL59.'
      case '3':
        return '💰 Price and stock data must be verified by showroom staff.\n\n' +
          'Try a product model such as D220 to see its specifications. Live pricing will be added with the database.'
      case '4':
        return '🛒 Purchase inquiries will be recorded after we add Supabase and staff approvals.\n' +
          'Purchases are for *showroom collection only*. Type a product model to begin browsing.'
      case '5':
        return '📦 Order tracking will be available when the staff-approved order module is implemented.'
      case '6':
        return '🛠️ Warranty and support tickets will be available after the admin portal is connected.\n' +
          'For now, contact info@thi.lk.'
      case '7':
        return SHOWROOM_INFO
      case '8':
        return '👨‍💼 Live staff handover is not active in this first connection test.\n' +
          'Please contact +94 70 709 0909. Type MENU to return.'
    }
  }

  return 'I could not match that request in the initial test menu.\n' +
    'Try D220, ST-9696 or type *MENU*.'
}
