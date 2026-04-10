import { Outlet } from 'react-router-dom'

/**
 * Layout for unauthenticated pages (login, register, forgot password).
 * Full-screen, centered, no navigation bar.
 * Mobile-first: content is vertically centered with comfortable padding.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      {/* Logo / App name header */}
      <header className="pt-12 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500 mb-4">
          {/* Heart icon — replace with real SVG in Phase 9 */}
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MamãeApp</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cada momento do seu bebê, registrado com amor</p>
      </header>

      {/* Page content (login form, register form, etc.) */}
      <main className="flex-1 flex flex-col px-4 pb-8">
        <div className="w-full max-w-sm mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
