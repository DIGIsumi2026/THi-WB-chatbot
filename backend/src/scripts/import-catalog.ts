import { readFile } from 'node:fs/promises'
import { getSupabase } from '../database/supabase.js'

interface CatalogSeed {
  catalog_item_no: number
  source_page: number
  brand: string
  category: string
  name: string
  model: string | null
  product_code: string | null
  specifications: string
  tags: string[]
  search_text: string
}

async function main() {
  const jsonUrl = new URL('../../data/thi-products-86.json', import.meta.url)
  const raw = await readFile(jsonUrl, 'utf8')
  const records = JSON.parse(raw) as CatalogSeed[]
  if (records.length !== 86 || new Set(records.map(x=>x.catalog_item_no)).size !== 86) {
    throw new Error('Seed integrity check failed: expected 86 unique items')
  }

  const db = getSupabase()
  for (let start = 0; start < records.length; start += 25) {
    const batch = records.slice(start, start + 25)
    // Insert only; don't overwrite staff-managed data when rerunning this import.
    const { error } = await db.from('products').upsert(batch, {
      onConflict: 'catalog_item_no', ignoreDuplicates: true
    })
    if (error) throw new Error(`Import failed at item ${start + 1}: ${error.message}`)
    console.log(`Processed catalog entries ${start + 1}–${start + batch.length}`)
  }
  const { count, error } = await db.from('products').select('*', { count:'exact', head:true })
  if (error) throw error
  console.log(`✅ Catalog import complete. Database row count: ${count ?? 'unknown'}`)
  if (count !== 86) console.warn('Table row count differs from the 86-item catalog; review existing rows.')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
