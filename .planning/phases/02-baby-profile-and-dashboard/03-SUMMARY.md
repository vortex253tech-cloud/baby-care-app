---
plan: "02-baby-profile-and-dashboard/03"
status: complete
completed: 2026-04-11
---

# Summary: Plan 03 — Baby photo upload + AvatarUploader component

## What was built
Client-side image compression utility plus avatar upload and display components, integrated into the onboarding flow.

## Key files created/modified
- `src/lib/compressImage.ts` — Canvas-only utility (zero npm deps). Scales image to max 512×512, outputs JPEG Blob at 80% quality. Uses `URL.createObjectURL` + `canvas.toBlob`.
- `src/components/baby/AvatarUploader.tsx` — Upload component:
  - Circular 80×80 avatar area (photo or SVG placeholder)
  - Hidden `<input type="file" accept="image/*">` triggered by click
  - Flow: compress → `supabase.storage.upload(path, blob, { upsert: true })` → `getPublicUrl` → `supabase.from('babies').update({ avatar_url })`
  - Loading spinner overlay during upload, inline error on failure
  - Calls `onUpload(url)` on success
- `src/components/baby/BabyAvatar.tsx` — Display-only component (no upload):
  - Shows `<img>` with `rounded-full object-cover` when `src` is set
  - Shows initials circle (pink bg) when no photo
  - Sizes: sm=32px, md=48px, lg=80px
- `src/pages/onboarding/BabyOnboardingPage.tsx` — Step 2 now uses real `AvatarUploader`; "Continuar" button appears after upload; "Pular por agora" always available

## Decisions made
- Canvas API used instead of `browser-image-compression` npm package — saves ~30KB bundle, sufficient for the 512×512 target
- Storage path: `{user.id}/{babyId}/avatar.jpg` — user_id prefix enables the RLS policy `(storage.foldername(name))[1] = auth.uid()::text` to work correctly
- `upsert: true` on upload — allows the same path to be replaced (re-upload / profile edit use case)

## Self-Check: PASSED
- [x] compressImage produces a Blob from any image file
- [x] AvatarUploader uploads to Supabase Storage and calls onUpload
- [x] BabyAvatar shows photo or initials fallback
- [x] Onboarding step 2 integrates AvatarUploader
- [x] tsc --noEmit exits 0
