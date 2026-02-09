import './styles.css'
import { Link, Outlet } from 'react-router'
import { DumpError, GlobalNavigationLoadingBar } from './routes/root.client'
import { ToastProvider } from './components/toast.client'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>Backyard Garden</title>
      </head>
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-earth-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-14">
            <Link
              to="/"
              className="flex items-center gap-2 text-garden-700 font-semibold text-lg no-underline"
            >
              <svg
                className="w-6 h-6"
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
              Backyard Garden
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-garden-700 hover:bg-garden-50 rounded-lg transition-colors no-underline"
              >
                Dashboard
              </Link>
              <Link
                to="/yard"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-garden-700 hover:bg-garden-50 rounded-lg transition-colors no-underline"
              >
                Yard
              </Link>
              <Link
                to="/calendar"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-garden-700 hover:bg-garden-50 rounded-lg transition-colors no-underline"
              >
                Calendar
              </Link>
              <Link
                to="/plants"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-garden-700 hover:bg-garden-50 rounded-lg transition-colors no-underline"
              >
                Plants
              </Link>
              <Link
                to="/log"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-garden-700 hover:bg-garden-50 rounded-lg transition-colors no-underline"
              >
                Log
              </Link>
              <Link
                to="/settings"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-garden-700 hover:bg-garden-50 rounded-lg transition-colors no-underline"
              >
                Settings
              </Link>
            </nav>
          </div>
        </header>
        <GlobalNavigationLoadingBar />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

export default function Component() {
  return <Outlet />
}

export function ErrorBoundary() {
  return <DumpError />
}
