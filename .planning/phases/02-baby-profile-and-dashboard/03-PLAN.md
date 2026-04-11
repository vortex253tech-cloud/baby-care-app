---
plan: "02-baby-profile-and-dashboard/03"
phase: 2
sequence: 3
title: "Baby photo upload + AvatarUploader component"
status: pending
requires: ["02-baby-profile-and-dashboard/01", "02-baby-profile-and-dashboard/02"]
---

# Plan 03: Baby photo upload + AvatarUploader component

## Objective
Add optional photo upload to the baby onboarding flow and profile edit screen, with client-side image compression and Supabase Storage integration.

## Requirements Addressed
- BABY-02: Usuária pode adicionar foto do bebê ao perfil

## Tasks

<task id="3.1" type="code">
  <title>Create image compression utility</title>
  <description>
Create `src/lib/compressImage.ts` using the Canvas API (no extra npm dep):

```typescript
/**
 * Compresses an image file to max 512×512 JPEG at 80% quality.
 * Uses Canvas API — no external dependency.
 */
export async function compressImage(file: File, maxSide = 512, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob returned null'))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    img.src = url
  })
}
```
  </description>
  <files>
    <file action="create">src/lib/compressImage.ts</file>
  </files>
</task>

<task id="3.2" type="code">
  <title>Create AvatarUploader component</title>
  <description>
Create `src/components/baby/AvatarUploader.tsx`:

Props:
```typescript
interface AvatarUploaderProps {
  babyId: string
  currentUrl: string | null
  onUpload: (url: string) => void
}
```

Behavior:
1. Shows circular avatar (80×80) with current photo or a placeholder SVG (baby face outline)
2. Clicking opens `<input type="file" accept="image/*">` (hidden)
3. On file selected:
   a. Compress with `compressImage(file)`
   b. Upload to `baby-photos/{user.id}/{babyId}/avatar.jpg` via `supabase.storage.from('baby-photos').upload(..., { upsert: true })`
   c. Get public URL: `supabase.storage.from('baby-photos').getPublicUrl(path).data.publicUrl`
      (Works because bucket is created as `public: true` in Plan 01 — returns a stable CDN URL)
   d. Update baby row: `supabase.from('babies').update({ avatar_url: url }).eq('id', babyId)`
   e. Call `onUpload(url)`
4. Show loading spinner overlay while uploading
5. Show error message if upload fails

Placeholder SVG when no photo: a simple pink circle with a baby icon inside.
  </description>
  <files>
    <file action="create">src/components/baby/AvatarUploader.tsx</file>
  </files>
</task>

<task id="3.3" type="code">
  <title>Integrate AvatarUploader into onboarding</title>
  <description>
After a baby is created in `BabyOnboardingPage.tsx`, show a second step:
- "Quer adicionar uma foto? (opcional)"
- Render `<AvatarUploader babyId={newBabyId} currentUrl={null} onUpload={...} />`
- "Pular por agora" button → navigate to `/dashboard`
- After photo upload, show "Continuar" button → navigate to `/dashboard`

Alternatively, add the photo step inline (same page, revealed after successful insert).
Use a simple two-step state machine: `'form' | 'photo'`.
  </description>
  <files>
    <file action="modify">src/pages/onboarding/BabyOnboardingPage.tsx</file>
  </files>
</task>

<task id="3.4" type="code">
  <title>Baby avatar display component</title>
  <description>
Create `src/components/baby/BabyAvatar.tsx` — a reusable avatar display component (not upload):

```typescript
interface BabyAvatarProps {
  src: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'  // 32px / 48px / 80px
  className?: string
}
```

- If `src` is set: show `<img>` with rounded-full and object-cover
- If no `src`: show initials circle (first letter of name, pink background)
- Sizes: sm=8 (32px), md=12 (48px), lg=20 (80px)
  </description>
  <files>
    <file action="create">src/components/baby/BabyAvatar.tsx</file>
  </files>
</task>

## Verification
- [ ] `src/lib/compressImage.ts` exists and correctly compresses images
- [ ] `AvatarUploader` uploads to Supabase Storage and calls `onUpload`
- [ ] Onboarding shows optional photo step after baby creation
- [ ] `BabyAvatar` shows either photo or initials fallback
- [ ] `tsc --noEmit` exits 0
