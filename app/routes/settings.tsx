import { Link } from 'react-router'
import { db } from '../db/index.ts'
import { settings } from '../db/schema.ts'
import { USDA_ZONES } from '../lib/zones.ts'
import { saveSettings } from './settings.actions.ts'
import { SubmitButton } from './settings.client.tsx'

const Component = async () => {
  const current = await db.select().from(settings).limit(1)
  const currentSettings = current[0]

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-garden-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900">Settings</span>
      </nav>

      <div className="bg-white rounded-xl border border-earth-200 shadow-sm">
        <div className="px-6 py-5 border-b border-earth-100">
          <h1 className="text-xl font-semibold text-gray-900">
            Garden Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your growing zone and frost dates to get personalized
            planting recommendations.
          </p>
        </div>

        <form className="px-6 py-6 space-y-5" action={saveSettings}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="zone"
            >
              USDA Hardiness Zone
            </label>
            <select
              className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
              id="zone"
              name="zone"
              defaultValue={currentSettings?.zone ?? ''}
            >
              <option value="">Select a zone</option>
              {USDA_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  Zone {zone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="lastFrostDate"
              >
                Last Frost Date (Spring)
              </label>
              <input
                className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
                id="lastFrostDate"
                type="date"
                name="lastFrostDate"
                defaultValue={currentSettings?.lastFrostDate ?? ''}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="firstFrostDate"
              >
                First Frost Date (Fall)
              </label>
              <input
                className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
                id="firstFrostDate"
                type="date"
                name="firstFrostDate"
                defaultValue={currentSettings?.firstFrostDate ?? ''}
              />
            </div>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  )
}

export default Component
