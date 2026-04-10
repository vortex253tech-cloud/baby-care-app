import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  title?: string
  showBack?: boolean
}

/**
 * Layout wrapper for all authenticated pages.
 * Provides: TopBar (sticky) + scrollable content area + BottomNav (fixed).
 * The content area has pb-20 to prevent content from hiding behind the bottom nav.
 */
export function AppShell({ title, showBack }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <TopBar title={title} showBack={showBack} />
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
