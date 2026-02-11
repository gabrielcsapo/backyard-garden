import './styles.css'
import { Outlet } from 'react-router'
import { DumpError, GlobalNavigationLoadingBar, Sidebar } from './routes/root.client'
import { ToastProvider } from './components/toast.client'
import { ConfirmDialogProvider } from './components/confirm-dialog.client'

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
        <GlobalNavigationLoadingBar />
        <Sidebar />
        <div className="lg:ml-56">
          <ToastProvider>
            <ConfirmDialogProvider>
              {children}
            </ConfirmDialogProvider>
          </ToastProvider>
        </div>
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
