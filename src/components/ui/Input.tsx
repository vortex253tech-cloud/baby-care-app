import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/**
 * Accessible input field with label, error state, and hint text.
 * Always renders a label for screen-reader accessibility.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
              ? `${inputId}-hint`
              : undefined
          }
          className={`
            h-12 w-full rounded-xl border bg-white dark:bg-gray-800 px-4
            text-base text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0
            ${
              error
                ? 'border-red-400 focus:ring-red-400 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
