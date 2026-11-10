# Varna Cloudflare — Edge-First E-Commerce & Concierge Platform

> **Version:** 2.0.0 (Cloudflare Architecture)  
> **Target Deployment:** Cloudflare Workers (`*.workers.dev`) with Static Assets  
> **Core Framework:** Astro 5.x • React 18 Islands • TypeScript 5 • Tailwind CSS 3.4  
> **Runtime Target:** Cloudflare Pages / Workers (`workerd` V8 Isolates)  
> **Database:** MongoDB Atlas (via native TCP sockets & `nodejs_compat`)  
> **Media CDN:** Cloudinary Global CDN (Direct Cloud Transformations)

---

## 1. Overview & Architecture

Varna Cloudflare is the edge-first evolution of the Varna luxury apparel storefront, purpose-built for deployment on **Cloudflare Pages / Workers**.

### Key Architectural Enhancements
1. **Zero-JS Island Architecture:**
   - Static marketing sections (Hero headers, category taxonomy, brand ethos, trust badges, footer) render directly at the Cloudflare edge as pure HTML.
   - Interactive components (Cart, Checkout flow, Product variant picker, Admin Vault) hydrate on-demand as isolated React Islands (`client:load` / `client:idle`).
2. **Sharp-Free Cloud Transformation Pipeline:**
   - Eliminates heavy C++ `libvips`/`sharp` server binaries (incompatible with V8 isolates).
   - `/api/admin/upload` signs and streams multipart uploads directly to Cloudinary using standard Web Crypto (`crypto.subtle` SHA-1), with Cloudinary automatically generating 1600×1600 WebP transformations.
3. **MongoDB Atlas Edge Resilience:**
   - Utilizes Cloudflare’s native TCP socket connectivity with `nodejs_compat`.
   - Dual-tier failover to an in-memory edge cache and `defaultStoreData.ts` ensures public visitors never receive a 500 error even during database cold-starts.
4. **Zero-Friction WhatsApp Concierge:**
   - Maintains the complete local-first checkout state machine, Pan-India courier address validation (28 states, 8 UTs), and real-time WhatsApp payload generator.
5. **Administrative Vault & 5-Tap Gateway:**
   - Hidden 5-tap logo easter egg in the Navbar unlocks the admin vault.
   - Multi-device passcode verification with edge cookie authentication.

---

## 2. Directory Structure

```text
varna-cloudflare/
├── public/                                # Public static assets & multi-res favicons
│   ├── favicon.ico                        # Google SERP multi-res ICO
│   ├── images/logo/                       # Brand monograms & transparent logos
│   └── images/banners/                    # Editorial lifestyle banners
├── src/
│   ├── pages/                             # Astro file-based routing & edge endpoints
│   │   ├── index.astro                    # Storefront homepage
│   │   ├── products/
│   │   │   ├── index.astro                # Catalog view & category filtering
│   │   │   └── [id].astro                 # Dynamic product detail page (Edge SSR + JSON-LD)
│   │   ├── cart.astro                     # Shopping bag page
│   │   ├── checkout.astro                 # Dedicated Indian courier checkout
│   │   ├── admin/
│   │   │   ├── index.astro                # Varna Command Vault dashboard
│   │   │   └── login.astro                # Passcode authentication gateway
│   │   ├── sitemap.xml.ts                 # Dynamic XML sitemap generator
│   │   ├── robots.txt.ts                  # Dynamic crawler directives
│   │   ├── manifest.json.ts               # Progressive Web App (PWA) manifest
│   │   └── api/admin/                     # Serverless edge API endpoints
│   │       ├── auth.ts                    # Passcode verification & session tokens
│   │       ├── store.ts                   # GET/POST store state with Atlas persistence
│   │       ├── upload.ts                  # Cloudinary direct stream uploader
│   │       └── enquiry.ts                 # WhatsApp lead & enquiry tracker
│   ├── components/                        # React interactive components
│   │   ├── layout/                        # AppShell, Navbar, TopBar, Footer
│   │   ├── sections/                      # HeroSlider, NewArrivals, CategoryGrid, Reviews
│   │   ├── product/                       # ProductDetailsView, ProductsCatalogClient
│   │   ├── checkout/                      # CheckoutView (Form state, Indian states)
│   │   ├── cart/                          # CartView, CartDrawer
│   │   └── admin/modules/                 # 9 Dashboard modules
│   ├── context/                           # Reactive state management
│   │   ├── StoreContext.tsx               # Store state, live drafts, search query
│   │   └── CartContext.tsx                # Shopping cart, delivery fees, saved address
│   ├── data/                              # defaultStoreData.ts (Fallback seed)
│   ├── lib/                               # Edge clients
│   │   ├── mongodb.ts                     # MongoDB client with 45s circuit breaker
│   │   ├── cloudinary.ts                  # Web Crypto signed Cloudinary uploader
│   │   ├── serverStore.ts                 # Server-side store reader for SSR & sitemaps
│   │   └── shims/                         # Drop-in compatibility shims
│   └── types/                             # TypeScript domain models
├── astro.config.mjs                       # Astro & Cloudflare adapter configuration
├── wrangler.jsonc                         # Cloudflare Pages / Workers configuration
└── package.json
```

---

## 3. Local Development

### Prerequisites
- Node.js `>= 20.x`
- npm `>= 10.x`

### Setup
```bash
# 1. Navigate to directory
cd varna-cloudflare

# 2. Install dependencies
npm install

# 3. Create .env.local file from .env.example
cp .env.example .env.local
# Add your MONGODB_URI and Cloudinary credentials

# 4. Start local development server
npm run dev
```

Visit `http://localhost:4321` to view the storefront.

---

## 4. Building & Cloudflare Deployment

### Local Production Build
```bash
npm run build
```
The compiled output will be generated in `dist/`, including:
- `_worker.js`: Cloudflare Worker SSR bundle.
- `_routes.json`: Cloudflare Pages routing configuration.
- `_astro/`: Optimized client assets and styles.

### Deploying to Cloudflare Workers (`*.workers.dev`) via Wrangler CLI
```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Deploy directly to your *.workers.dev subdomain
npm run deploy
# Or: npx wrangler deploy
```

When deployment finishes, Wrangler will output your live URL:
`https://varna-store.<your-subdomain>.workers.dev`

### Setting Secrets on Cloudflare Workers
Before your first deployment, configure your secrets in Cloudflare:
```bash
npx wrangler secret put MONGODB_URI
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
npx wrangler secret put ADMIN_PASSCODE
```

### Deploying via GitHub to Cloudflare Pages Dashboard
1. Connect your GitHub repository to Cloudflare Pages.
2. Select **Astro** as the framework preset.
3. Configure the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add your Environment Variables in **Settings > Environment Variables**:
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSCODE`
   - `PUBLIC_SITE_URL`
