/**
 * Full-screen centered loading spinner.
 * Used while async data is loading before content can be shown.
 */
export function FullScreenSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <svg
        className="w-10 h-10 animate-spin text-pink-400"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Carregando"
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
    </div>
  )
}
