'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const status = useFormStatus()
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-garden-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 focus:outline-none focus:ring-2 focus:ring-garden-500/20 disabled:opacity-50 transition-colors cursor-pointer"
      type="submit"
      disabled={status.pending}
    >
      {status.pending ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving...
        </>
      ) : (
        'Save Settings'
      )}
    </button>
  )
}
