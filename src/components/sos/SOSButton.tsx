// ─── SOS Floating Action Button ───────────────────────────────────────────────
// Fixed button always visible above the bottom nav.
// Opens the SOSModal on press.

import { useState } from 'react'
import { SOSModal } from './SOSModal'

export function SOSButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-20 right-4 z-30
          w-12 h-12 rounded-full
          bg-red-500 text-white shadow-lg shadow-red-500/40
          flex items-center justify-center
          active:scale-90 transition-transform
          border-2 border-red-400
        "
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="SOS — Emergência"
      >
        <span className="text-lg font-black leading-none">SOS</span>
      </button>

      {/* Modal */}
      {open && <SOSModal onClose={() => setOpen(false)} />}
    </>
  )
}
