import { readFile } from 'node:fs/promises'
import { getSupabase } from '../database/supabase.js'

const BUCKET = 'thi-catalog-images'

async function main() {
  const db = getSupabase()
  const { data: existing, error: lookupError } = await db.storage.getBucket(BUCKET)
  if (lookupError && !/not found/i.test(lookupError.message)) {
    // Supabase sometimes reports an HTTP 404 for absent buckets.
    const status = (lookupError as { statusCode?: string }).statusCode
    if (status !== '404') throw lookupError
  }
  if (!existing) {
    const { error } = await db.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 1024 * 1024,
      allowedMimeTypes: ['image/jpeg']
    })
    if (error) throw error
  }

  for (let number = 1; number <= 86; number++) {
    const filename = `${String(number).padStart(3,'0')}.jpg`
    const bytes = await readFile(new URL(`../../data/catalog-images/${filename}`, import.meta.url))
    const { error: uploadError } = await db.storage.from(BUCKET).upload(filename, bytes, {
      contentType: 'image/jpeg',
      upsert: true
    })
    if (uploadError) throw new Error(`Image ${filename}: ${uploadError.message}`)
    const url = db.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl
    const { error: updateError } = await db.from('products')
      .update({ image_url: url }).eq('catalog_item_no', number)
    if (updateError) throw new Error(`Product ${number}: ${updateError.message}`)
    if (number % 10 === 0) console.log(`Uploaded ${number}/86 images`)
  }
  console.log('✅ Image upload complete. Review image crops in the admin panel before public use.')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
