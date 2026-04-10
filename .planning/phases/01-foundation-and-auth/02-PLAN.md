---
id: "01-foundation-and-auth/02"
phase: 1
plan: 2
wave: 1
depends_on: []
autonomous: true
files_modified:
  - "package.json"
  - "vite.config.ts"
  - "tsconfig.json"
  - "tsconfig.node.json"
  - "tailwind.config.ts"
  - "postcss.config.js"
  - "index.html"
  - "src/main.tsx"
  - "src/App.tsx"
  - "src/index.css"
  - "src/vite-env.d.ts"
  - "src/lib/supabase.ts"
  - "public/manifest.json"
  - ".gitignore"
requirements: ["AUTH-01", "AUTH-02", "AUTH-03", "AUTH-04", "AUTH-05", "AUTH-06"]
must_haves:
  - "Running `npm run dev` starts the app at http://localhost:5173 with no errors"
  - "TailwindCSS is working — a test class like `bg-pink-500` applies correctly"
  - "TypeScript compiles with zero errors via `npm run type-check`"
  - "supabase.ts exports a working Supabase client that reads from .env.local"
  - "manifest.json is served and referenced in index.html"
---

# Plan 02: Vite + React 18 + TypeScript + TailwindCSS + PWA Manifest Base

## Objective
Scaffold the complete frontend project with all core dependencies installed, TypeScript and Tailwind configured, Supabase client set up, and a minimal PWA manifest in place so all subsequent plans have a working base to build on.

## Context
This plan runs in parallel with Plan 01 (Wave 1) since Vite scaffolding is independent of Supabase configuration. Plans 03–06 all depend on this plan because they add React components, routes, and auth flows to the project structure created here. The folder structure established here (`src/pages/`, `src/components/`, `src/lib/`) is the layout the rest of the project follows.

## Tasks

<tasks>
  <task id="1" type="implement">
    <description>Scaffold Vite + React 18 + TypeScript project</description>
    <details>
Run from `C:/Users/Ezequ/Desktop/`:

```bash
npm create vite@latest baby-care-app -- --template react-ts
cd baby-care-app
npm install
```

This creates the project. If the directory already exists (project was initialized via GSD), skip the create step and just run `npm install`.

Verify the generated `package.json` has:
- `"react": "^18.x.x"`
- `"vite": "^5.x.x"` (or latest stable)
- `"typescript": "^5.x.x"`
    </details>
    <verification>`npm run dev` starts without errors and the browser shows the default Vite+React page at http://localhost:5173.</verification>
  </task>

  <task id="2" type="implement">
    <description>Install all Phase 1 dependencies</description>
    <details>
Run from the project root `C:/Users/Ezequ/Desktop/baby-care-app/`:

```bash
# Supabase client
npm install @supabase/supabase-js@^2.45.4

# Routing
npm install react-router-dom@^6.26.2

# Forms and validation
npm install react-hook-form@^7.53.0 zod@^3.23.8 @hookform/resolvers@^3.9.0

# PWA plugin for Vite
npm install -D vite-plugin-pwa@^0.20.5

# Tailwind and PostCSS
npm install -D tailwindcss@^3.4.14 postcss@^8.4.47 autoprefixer@^10.4.20
```

After install, verify `package.json` lists all packages above in `dependencies` or `devDependencies`.
    </details>
    <verification>`node_modules/@supabase/supabase-js`, `node_modules/react-router-dom`, `node_modules/react-hook-form`, `node_modules/zod`, and `node_modules/tailwindcss` all exist.</verification>
  </task>

  <task id="3" type="implement">
    <description>Configure TailwindCSS</description>
    <details>
Run:
```bash
npx tailwindcss init -p
```

This creates `tailwind.config.js` and `postcss.config.js`. Rename the Tailwind config to TypeScript:

Replace `tailwind.config.js` with `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  // Dark mode uses class strategy (toggled manually or by system preference)
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — rose/pink for the app's primary color
        brand: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        // Minimum supported width
        'xs': '320px',
      },
    },
  },
  plugins: [],
}

export default config
```

Update `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
    </details>
    <verification>Running `npx tailwindcss --help` works. The config file exists at `tailwind.config.ts`.</verification>
  </task>

  <task id="4" type="implement">
    <description>Set up global CSS with Tailwind directives and Inter font</description>
    <details>
Replace the entire contents of `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    /* Prevent font size inflation on mobile */
    -webkit-text-size-adjust: 100%;
  }

  body {
    @apply bg-white text-gray-900 antialiased;
    /* Support dark mode at OS level */
  }

  /* Dark mode base */
  .dark body {
    @apply bg-gray-950 text-gray-50;
  }

  /* Safe area padding for iOS notch / Android gesture bar */
  #root {
    @apply min-h-screen;
    padding-bottom: env(safe-area-inset-bottom);
  }
}

@layer utilities {
  /* Touch target minimum size for mobile — WCAG 2.5.5 */
  .touch-target {
    @apply min-h-[44px] min-w-[44px];
  }
}
```
    </details>
    <verification>After hot-reload, browser DevTools shows the Inter font being loaded and `body` has `antialiased` class applied.</verification>
  </task>

  <task id="5" type="implement">
    <description>Configure Vite for PWA and path aliases</description>
    <details>
Replace `vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // We manage manifest.json manually in /public
      workbox: {
        // Will be expanded in Phase 9. For now, minimal SW.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [],
      },
      devOptions: {
        enabled: false, // Disable SW in dev to avoid caching issues
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
```

Update `tsconfig.json` to support the `@/` alias. Find the `compilerOptions` section and add:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Install the `@types/node` package for path resolution in vite.config.ts:
```bash
npm install -D @types/node
```
    </details>
    <verification>`npm run build` completes with no TypeScript errors. The `@/` alias resolves correctly in any `.tsx` file.</verification>
  </task>

  <task id="6" type="implement">
    <description>Create Supabase client singleton</description>
    <details>
Create directory `src/lib/` and file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so AUTH-04 works (stay logged in)
    persistSession: true,
    // Auto-refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL hash (needed for email confirmation links)
    detectSessionInUrl: true,
  },
})

// Type helper — will be used in auth hooks
export type SupabaseClient = typeof supabase
```

Add the Vite env type declarations to `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```
    </details>
    <verification>Importing `supabase` from `@/lib/supabase` in any component works without TypeScript errors. The client is created once (singleton).</verification>
  </task>

  <task id="7" type="implement">
    <description>Create PWA manifest.json and placeholder icons</description>
    <details>
Create `public/manifest.json`:

```json
{
  "name": "MamãeApp",
  "short_name": "MamãeApp",
  "description": "Acompanhe o desenvolvimento do seu bebê com amor e praticidade",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f43f5e",
  "orientation": "portrait-primary",
  "lang": "pt-BR",
  "categories": ["health", "lifestyle", "parenting"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Registrar mamada",
      "url": "/feed/new",
      "description": "Registrar uma nova mamada rapidamente"
    }
  ]
}
```

Create directory `public/icons/`. Add placeholder PNG files (any 192x192 and 512x512 pink square image will do for now; proper icons are due in Phase 9 Plan 1). You can generate placeholders with:

```bash
# Using ImageMagick if available, or use any online tool
# to create a solid #f43f5e square at 192x192 and 512x512
# Save as public/icons/icon-192.png, icon-512.png, icon-512-maskable.png
```

If ImageMagick is unavailable, create a simple SVG placeholder and note in comments that real icons are needed for Phase 9.

Update `index.html` to reference the manifest and add meta tags:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#f43f5e" />
    <meta name="description" content="Acompanhe o desenvolvimento do seu bebê com amor e praticidade" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="MamãeApp" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <title>MamãeApp</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
    </details>
    <verification>Opening browser DevTools → Application → Manifest shows the manifest loaded with correct name, theme_color (#f43f5e), and display (standalone).</verification>
  </task>

  <task id="8" type="implement">
    <description>Set up project folder structure and clean up Vite defaults</description>
    <details>
Create the following empty directories and index files to establish the project structure:

```
src/
├── assets/               # Static assets (images, SVGs)
├── components/
│   ├── auth/             # Auth-specific components (LoginForm, etc.)
│   ├── layout/           # Shell, nav, layout components
│   └── ui/               # Reusable UI primitives (Button, Input, etc.)
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # (stub — implemented in Plan 04)
├── lib/
│   └── supabase.ts       # Already created above
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx         # Stub
│   │   ├── RegisterPage.tsx      # Stub
│   │   ├── ForgotPasswordPage.tsx # Stub
│   │   └── ResetPasswordPage.tsx  # Stub
│   └── DashboardPage.tsx          # Stub
├── types/
│   └── index.ts          # Shared TypeScript types
└── utils/
    └── index.ts          # Utility functions
```

Replace `src/App.tsx` with a minimal placeholder (routing will be added in Plan 03):

```typescript
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-500">MamãeApp</h1>
        <p className="text-gray-500 mt-2">Scaffolding completo ✓</p>
      </div>
    </div>
  )
}

export default App
```

Replace `src/main.tsx` with:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Delete the default Vite files: `src/assets/react.svg`, `public/vite.svg`, `src/App.css`.

Add to `.gitignore` if not already present:
```
# Env files
.env.local
.env.*.local

# Build output
dist/

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```
    </details>
    <verification>
- `npm run dev` shows a centered "MamãeApp" title with the brand pink color
- `npm run build` completes with 0 TypeScript errors
- All folder directories exist under `src/`
    </verification>
  </task>

  <task id="9" type="implement">
    <description>Add npm scripts for type-checking</description>
    <details>
Update `package.json` scripts section to add a type-check command:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

Run `npm run type-check` and fix any TypeScript errors before proceeding.
    </details>
    <verification>`npm run type-check` exits with code 0 (no errors).</verification>
  </task>
</tasks>

## Verification Criteria
- [ ] `npm run dev` starts at http://localhost:5173 showing "MamãeApp" title with pink brand color
- [ ] `npm run type-check` exits with 0 errors
- [ ] `npm run build` completes successfully (output in `dist/`)
- [ ] Browser DevTools → Application → Manifest shows manifest loaded with `name: "MamãeApp"` and `theme_color: "#f43f5e"`
- [ ] `src/lib/supabase.ts` creates a Supabase client using env vars (not hardcoded)
- [ ] `src/index.css` contains `@tailwind base/components/utilities` directives
- [ ] A test element with `className="bg-brand-500"` renders as a rose/pink color
- [ ] All required directories exist: `src/components/`, `src/pages/`, `src/hooks/`, `src/lib/`, `src/types/`, `src/utils/`

## Notes
- The `vite-plugin-pwa` SW is disabled in dev mode (`devOptions.enabled: false`) to prevent aggressive caching during development. It will be fully configured in Phase 9.
- The `darkMode: 'class'` strategy means dark mode is controlled by adding/removing the `dark` class on `<html>`. Phase 2 will add the actual dark mode detection logic.
- Inter font is loaded from Google Fonts CDN. Phase 9 can switch to self-hosted if needed for offline support.
- Placeholder icons in `public/icons/` are temporary. Real branded icons must be designed before Phase 9 (PWA Polish).
