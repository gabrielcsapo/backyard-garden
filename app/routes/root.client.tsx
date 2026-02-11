'use client'

import React from 'react'
import { Link, useLocation, useNavigation, useRouteError } from 'react-router'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Yard',
    to: '/yard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 3v18" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    to: '/calendar',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Plants',
    to: '/plants',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
      </svg>
    ),
  },
  {
    label: 'Log',
    to: '/log',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
]

const SETTINGS_ITEM = {
  label: 'Settings',
  to: '/settings',
  icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: { label: string; to: string; icon: React.ReactNode }
  isActive: boolean
  collapsed: boolean
}) {
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
        isActive
          ? 'bg-garden-50 text-garden-700'
          : 'text-gray-500 hover:text-gray-900 hover:bg-earth-50'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}

export function Sidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  // Close mobile menu on navigation
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg bg-white border border-earth-200 shadow-sm text-gray-600 hover:text-gray-900 cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileOpen ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white border-r border-earth-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-56 lg:w-56`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-earth-100 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-garden-700 font-semibold text-base no-underline"
          >
            <svg
              className="w-6 h-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
            <span>Backyard Garden</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col px-3 py-3 gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              isActive={isActive(item.to)}
              collapsed={false}
            />
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t border-earth-100 px-3 py-3">
          <NavLink
            item={SETTINGS_ITEM}
            isActive={isActive(SETTINGS_ITEM.to)}
            collapsed={false}
          />
        </div>
      </aside>
    </>
  )
}

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
