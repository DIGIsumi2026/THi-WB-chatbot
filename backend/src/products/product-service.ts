import { getSupabase } from '../database/supabase.js'

export interface CatalogProduct {
  id: string
  catalog_item_no: number
  name: string
  brand: string
  category: string
  model: string | null
  product_code: string | null
  specifications: string
  image_url: string | null
  price_lkr: number | null
  price_verified_at: string | null
  availability_status: 'unverified' | 'in_stock' | 'limited' | 'out_of_stock'
  source_page: number | null
}

export async function searchProducts(query: string, offset = 0, limit = 5): Promise<CatalogProduct[]> {
  const { data, error } = await getSupabase().rpc('search_catalog', {
    query_text: query,
    result_limit: limit,
    result_offset: offset
  })
  if (error) throw new Error(`Supabase catalog search failed: ${error.message}`)
  return (data ?? []) as CatalogProduct[]
}

export function priceLabel(p: CatalogProduct): string {
  // A number without verification is not an approved selling price.
  if (p.price_lkr === null || !p.price_verified_at) return 'Contact sales to confirm'
  return `LKR ${Number(p.price_lkr).toLocaleString('en-LK', { maximumFractionDigits: 2 })} (staff verified)`
}

export function stockLabel(p: CatalogProduct): string {
  switch (p.availability_status) {
    case 'in_stock': return 'In stock (subject to final staff confirmation)'
    case 'limited': return 'Limited stock (please confirm)'
    case 'out_of_stock': return 'Out of stock'
    default: return 'Please confirm with sales'
  }
}
