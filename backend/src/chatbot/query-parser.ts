export type QueryIntent = 'browse' | 'price' | 'stock' | 'details'

const replacements: Array<[RegExp, string]> = [
  [/\bbluetooth\s+(?:speakers?|spekers?|sound\s*boxes?)\b/gi, 'bluetooth speaker'],
  [/\bgaming\s+mouse(s)?\b/gi, 'gaming mouse'],
  [/\bgaming\s+mice\b/gi, 'gaming mouse'],
  [/\bw[- ]king\b/gi, 'wking'],
  [/\b(inches)\b/gi, 'inch'],
  [/\bear\s+buds\b/gi, 'earbuds'],
  [/\bsmart\s+televisions?\b/gi, 'smart tv'],
  [/\btelevisions?\b/gi, 'tv'],
  [/\bhead\s*phones?\b/gi, 'headphones'],
  [/\bair\s*fryers?\b/gi, 'air fryer'],
  [/\bmouse(s)?\b/gi, 'mouse'],
  [/\bsp[e]?akers?\b/gi, 'speaker']
]

const stopwords = new Set([
  'i','me','my','we','our','can','could','you','your','please','show','tell',
  'find','give','want','need','looking','for','a','an','the','is','are','do',
  'does','have','has','in','at','of','about','any','some','available','availability',
  'details','detail','spec','specs','specification','specifications',
  'price','prices','pricing','cost','much','how','stock','check','what',
  'buy','purchase','send','with','on','this','that','to','from','there',
  'hi','hello','list','products','product','models','model','options','items',
  'item','catalog','recommend','recommended','recommendations','suggest','sell','selling','offers','offer','which','does','stocked','please'
])

export function parseProductQuery(input: string): { query: string; intent: QueryIntent } {
  const raw = input.toLowerCase().trim()
  const intent: QueryIntent = /\b(how\s+much|cost|price|pricing)\b/.test(raw) ? 'price'
    : /\b(stock|available|availability)\b/.test(raw) ? 'stock'
    : /\b(details|specs|specifications|features)\b/.test(raw) ? 'details'
    : 'browse'

  let normalized = raw
  for (const [pattern, substitute] of replacements) normalized = normalized.replace(pattern, substitute)

  // Keep model punctuation (+, -), which is meaningful for model names.
  const tokens = normalized
    .replace(/[^\p{L}\p{N}+\-]+/gu, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0 && !stopwords.has(token))

  // Keep up to 7 informative tokens. No SQL is constructed from user input here.
  return { query: tokens.slice(0, 7).join(' ').trim(), intent }
}
