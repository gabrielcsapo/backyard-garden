import { db } from './index.ts'
import { plants } from './schema.ts'
import { SEED_PLANTS } from './seed-data.ts'

async function seed() {
  const existing = await db.select().from(plants).limit(1)
  if (existing.length > 0) {
    console.log('Plants table already has data, skipping seed.')
    return
  }

  console.log(`Seeding ${SEED_PLANTS.length} plants...`)
  for (const plant of SEED_PLANTS) {
    await db.insert(plants).values(plant)
  }
  console.log('Done!')
}

seed().catch(console.error)
