import { MAIN_MENU, SHOWROOM_INFO } from './menu.js'
import { parseProductQuery } from './query-parser.js'
import { priceLabel, searchProducts, stockLabel, type CatalogProduct } from '../products/product-service.js'

export interface BotReply { text: string; imageUrl?: string }
interface SearchState { term: string; nextOffset: number }
const recentSearch = new Map<string, SearchState>() // Temporary; persisted session state comes later.
const PAGE_SIZE = 5
const plain = (text: string): BotReply => ({ text })

function displayName(p: CatalogProduct): string {
  return p.model && !p.name.toLowerCase().includes(p.model.toLowerCase())
    ? `${p.name} (${p.model})` : p.name
}

function specsExcerpt(specifications: string, max = 120): string {
  if (!specifications) return 'Please ask our sales team for specifications.'
  if (specifications.length <= max) return specifications
  const shortened = specifications.slice(0, max).replace(/\s+\S*$/, '')
  return `${shortened}…`
}

function singleProduct(p: CatalogProduct): BotReply {
  const text = `📦 *${displayName(p)}*\n` +
    `🏷️ Brand: ${p.brand}\n` +
    `📝 Specs: ${p.specifications || 'Ask our sales team'}\n\n` +
    `💰 Price: ${priceLabel(p)}\n` +
    `📦 Stock: ${stockLabel(p)}\n\n` +
    `For an inquiry, type *agent* to reach staff.\n` +
    `🏬 *Showroom collection only.*\n` +
    `Type *MENU* for help.`
  return { text, imageUrl: p.image_url ?? undefined }
}

function listing(products: CatalogProduct[], term: string, hasMore: boolean): BotReply {
  const items = products.map(p =>
    `• *${displayName(p)}*\n` +
    `  ${specsExcerpt(p.specifications)}\n` +
    `  💰 ${priceLabel(p)}`
  ).join('\n\n')
  return plain(`🔎 *Matching products — ${term}*\n\n${items}\n\n` +
    `Reply with a product model (e.g. *D220*) to see complete details.` +
    (hasMore ? '\nType *MORE* to see additional products.' : '') +
    '\nType *MENU* for help.')
}

async function showResults(jid: string, term: string, offset = 0): Promise<BotReply> {
  const fetched = await searchProducts(term, offset, PAGE_SIZE + 1)
  const products = fetched.slice(0, PAGE_SIZE)
  if (!products.length) {
    if (offset) {
      recentSearch.delete(jid)
      return plain('No more matching products. Type a new search or MENU.')
    }
    return plain(`No catalog products matched *${term}*.\n` +
      'Try a category like *gaming mouse*, or type *agent* for assistance.')
  }
  const hasMore = fetched.length > PAGE_SIZE
  if (hasMore) recentSearch.set(jid, { term, nextOffset: offset + PAGE_SIZE })
  else recentSearch.delete(jid)
  if (offset === 0 && products.length === 1) return singleProduct(products[0])
  return listing(products, term, hasMore)
}

export async function replyFor(jid: string, message: string): Promise<BotReply> {
  const input = message.trim()
  const lower = input.toLowerCase().replace(/\s+/g, ' ')
  if (!input || input.length > 250) return plain('Please enter a short product name or model, such as *Bluetooth speaker*.')

  if (/^(hi|hello|hey|start|menu|help|home|cancel)$/i.test(lower)) {
    recentSearch.delete(jid)
    return plain(MAIN_MENU)
  }
  if (/^(more|next|show more)$/i.test(lower)) {
    const old = recentSearch.get(jid)
    return old ? trySearch(jid, old.term, old.nextOffset)
      : plain('Please search for a product first, such as *Bluetooth speaker*.')
  }
  if (/\b(delivery|shipping|courier)\b/i.test(lower)) {
    return plain('🏬 THi offers *showroom collection only*. Delivery is unavailable. Type *showroom* for the address.')
  }
  if (/^(showroom|location|address|contact|visit|where are you)$/i.test(lower)) return plain(SHOWROOM_INFO)
  if (/^(agent|staff|sales|human|talk to sales|speak to someone)$/i.test(lower)) {
    return plain('👨‍💼 Our sales team can confirm prices, availability and purchases.\n' +
      '📞 +94 70 709 0909\n📧 info@thi.lk\n\n' +
      'A live staff inbox will be added in the next phase.')
  }
  if (/^(support|warranty|repair|complaint|technical support)$/i.test(lower)) {
    return plain('🛠️ For support and warranty assistance, contact info@thi.lk or +94 70 709 0909.\n' +
      'Support-ticket registration will be implemented with the admin portal.')
  }
  if (/^(order status|track order|my order|purchase inquiry|buy)$/i.test(lower)) {
    return plain('🛒 Orders and purchase inquiries will be submitted after we connect the staff approval dashboard.\n' +
      'For now, contact +94 70 709 0909. Showroom collection only.')
  }
  if (/^\d$/.test(lower)) return plain('You can now search by product name instead of menu numbers. Try *Bluetooth speaker* or *air fryer*.')

  const { query } = parseProductQuery(input)
  if (!query) return plain('Tell us a product name or model, e.g. *43 inch TV*, *Bluetooth speaker*, or *D220*.')
  return trySearch(jid, query)
}

async function trySearch(jid: string, query: string, offset = 0): Promise<BotReply> {
  try {
    return await showResults(jid, query, offset)
  } catch (error) {
    console.error('[THi product database]', error)
    return plain('Our catalog is temporarily unavailable. Please try again later or contact +94 70 709 0909.')
  }
}
