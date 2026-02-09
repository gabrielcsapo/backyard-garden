'use client'

import { useNavigation, useRouteError } from 'react-router'

export function GlobalNavigationLoadingBar() {
  const navigation = useNavigation()

  if (navigation.state === 'idle') return null

  return (
    <div className="h-0.5 w-full bg-garden-100 overflow-hidden fixed top-0 left-0 z-50">
      <div className="animate-progress origin-[0%_50%] w-full h-full bg-garden-500" />
    </div>
  )
}

export function DumpError() {
  const error = useRouteError()
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Something went wrong
      </h1>
      {error instanceof Error ? (
        <div className="text-left bg-white rounded-xl border border-red-200 p-6">
          <p className="text-red-600 font-medium mb-2">{error.message}</p>
          {error.stack && (
            <pre className="text-xs text-gray-500 overflow-auto whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      ) : (
        <p className="text-gray-500">An unknown error occurred.</p>
      )}
    </main>
  )
}
