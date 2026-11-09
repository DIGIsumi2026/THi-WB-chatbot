import { readFile } from 'node:fs/promises'
interface Item { catalog_item_no: number; tags: string[]; brand: string }
const seed = JSON.parse(await readFile(new URL('../../data/thi-products-86.json', import.meta.url),'utf8')) as Item[]
if (seed.length!==86 || seed.some((p,i)=>p.catalog_item_no!==i+1)) throw Error('86-item seed integrity failed')
console.log('✅ All 86 catalog entries present.')
console.log('Bluetooth speakers:',seed.filter(p=>p.tags.includes('bluetooth speaker')).length)
console.log('R8 gaming mice:',seed.filter(p=>p.brand==='R8' && p.tags.includes('gaming mouse')).length)
