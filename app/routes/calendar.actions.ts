'use server'

import { eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { logEntries, plantings } from '../db/schema.ts'

export async function markCalendarTaskDone(formData: FormData) {
  const plantingId = Number(formData.get('plantingId'))
  const type = formData.get('type') as string
  const yardElementId = formData.get('yardElementId')
    ? Number(formData.get('yardElementId'))
    : null
  const newStatus = formData.get('newStatus') as string | null

  if (!plantingId || !type) {
    return { success: false, error: 'Planting and type are required.' }
  }

  const today = new Date().toISOString().split('T')[0]

  // Create log entry
  await db.insert(logEntries).values({
    plantingId,
    yardElementId,
    date: today,
    type,
    content: `Completed: ${type}`,
  })

  // Advance planting status if applicable
  if (newStatus) {
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'seeded' || newStatus === 'transplanted') {
      updates.plantedDate = today
    }
    await db
      .update(plantings)
      .set(updates)
      .where(eq(plantings.id, plantingId))
  }

  return { success: true }
}
