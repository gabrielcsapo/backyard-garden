'use server'

import { eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { settings } from '../db/schema.ts'

export async function saveSettings(formData: FormData) {
  const zone = formData.get('zone') as string
  const lastFrostDate = formData.get('lastFrostDate') as string
  const firstFrostDate = formData.get('firstFrostDate') as string

  const existing = await db.select().from(settings).limit(1)

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ zone, lastFrostDate, firstFrostDate })
      .where(eq(settings.id, existing[0].id))
  } else {
    await db.insert(settings).values({ zone, lastFrostDate, firstFrostDate })
  }
}
