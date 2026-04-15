import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { SOSButton } from '@/components/sos/SOSButton'

interface AppShellProps {
  title?: string
  showBack?: boolean
}

/**
 * Layout wrapper for all authenticated pages.
 * Provides: TopBar (sticky) + scrollable content area + BottomNav (fixed) + SOS FAB.
 */
export function AppShell({ title, showBack }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <TopBar title={title} showBack={showBack} />
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <SOSButton />
    </div>
  )
}
