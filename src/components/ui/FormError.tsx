interface FormErrorProps {
  message?: string | null
}

/**
 * Displays a top-level form error (e.g., "Email ou senha incorretos").
 * Use for errors returned by the server, not field-level validation errors.
 */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3"
    >
      <svg
        className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  )
}
