import "./styles.css";
import { Outlet } from "react-router";
import { DumpError, GlobalNavigationLoadingBar, Sidebar } from "./routes/root.client";
import { ToastProvider } from "./components/toast.client";
import { ConfirmDialogProvider } from "./components/confirm-dialog.client";
import { ThemeProvider } from "./components/theme-provider.client";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <title>Backyard Garden</title>
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <GlobalNavigationLoadingBar />
          <Sidebar />
          <div className="lg:ml-56">
            <ToastProvider>
              <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
            </ToastProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function Component() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <DumpError />;
}
