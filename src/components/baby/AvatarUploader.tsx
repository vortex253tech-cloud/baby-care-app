import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { compressImage } from '@/lib/compressImage'

// ── Props ─────────────────────────────────────────────────────────────────────

interface AvatarUploaderProps {
  babyId: string
  currentUrl: string | null
  onUpload: (url: string) => void
}

// ── Placeholder SVG ───────────────────────────────────────────────────────────

function BabyPlaceholder() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Pink circle background */}
      <circle cx="40" cy="40" r="40" fill="#fce7f3" />
      {/* Baby face */}
      <circle cx="40" cy="36" r="16" fill="#fbcfe8" />
      {/* Eyes */}
      <circle cx="34" cy="34" r="2.5" fill="#9d174d" />
      <circle cx="46" cy="34" r="2.5" fill="#9d174d" />
      {/* Smile */}
      <path
        d="M33 40 Q40 46 47 40"
        stroke="#9d174d"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body hint */}
      <ellipse cx="40" cy="62" rx="14" ry="10" fill="#fbcfe8" />
    </svg>
  )
}

// ── Loading spinner ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
      <svg
        className="w-8 h-8 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
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

// ── Component ─────────────────────────────────────────────────────────────────

export function AvatarUploader({ babyId, currentUrl, onUpload }: AvatarUploaderProps) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (!uploading) inputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setError(null)
    setUploading(true)

    try {
      // 1. Compress
      const blob = await compressImage(file)

      // 2. Upload with upsert
      const path = `${user.id}/${babyId}/avatar.jpg`
      const { error: uploadError } = await supabase.storage
        .from('baby-photos')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // 3. Get public URL
      const { data } = supabase.storage.from('baby-photos').getPublicUrl(path)
      const publicUrl = data.publicUrl

      // 4. Update babies row
      const { error: updateError } = await supabase
        .from('babies')
        .update({ avatar_url: publicUrl })
        .eq('id', babyId)

      if (updateError) throw updateError

      // 5. Notify parent and update preview
      setPreviewUrl(publicUrl)
      onUpload(publicUrl)
    } catch (err) {
      setError('Não foi possível enviar a foto. Tente novamente.')
      console.error('AvatarUploader error:', err)
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle — click to upload */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        aria-label="Alterar foto do bebê"
        className={`
          relative w-20 h-20 rounded-full overflow-hidden
          ring-2 ring-pink-300 dark:ring-pink-600
          focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400
          transition-opacity
          ${uploading ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        `}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Foto do bebê"
            className="w-full h-full object-cover"
          />
        ) : (
          <BabyPlaceholder />
        )}

        {uploading && <Spinner />}

        {/* Edit overlay hint */}
        {!uploading && (
          <span className="absolute bottom-0 inset-x-0 bg-black/30 text-white text-[9px] text-center py-0.5 font-medium">
            Editar
          </span>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Toque para {previewUrl ? 'trocar' : 'adicionar'} foto
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="text-xs text-red-500 dark:text-red-400 text-center max-w-[200px]"
        >
          {error}
        </p>
      )}
    </div>
  )
}
