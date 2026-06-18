# Aurelia Events — Build Reference (read before adding pages)

Stack: **Next.js 16 App Router, React 19, TypeScript, Tailwind v4** (CSS tokens in `src/app/globals.css`). Path alias `@/*` → `src/*`. Design-only build (mock data, no real backend/auth).

## Aesthetic
Light, ivory, image-forward, elegant. Serif display (Playfair) + Inter body. Muted gold accent. **No dark mode, no glow, no heavy gradients.** Soft shadows only on raised elements. 8px grid. Radius 8–12px. Motion 200–250ms via `ease-[var(--ease-elegant)]`.

## Color tokens (Tailwind utilities, e.g. `bg-ivory`, `text-ink`, `border-line`)
- Surfaces: `ivory` (page bg), `paper` (#fff cards), `line` / `line-strong` (borders)
- Text: `ink` (primary), `ink-soft` (secondary), `ink-muted` (muted)
- Accent: `gold`, `gold-dark` (hover), `gold-deep` (active/text-on-soft), `gold-soft` (tint bg), `gold-tint` (lighter tint band)
- Semantic: `success`/`success-soft`, `warning`/`warning-soft`, `danger`/`danger-soft`, `info`/`info-soft`
- Fonts: `font-serif` (headings), `font-sans` (body, default). `h1–h4` are serif by default.
- Helper class `eyebrow` (uppercase gold label), `.skeleton`, `.rise-in`.

## Components (import from these exact paths)
- `@/components/ui/button` → `<Button variant="primary|secondary|ghost|outline|destructive|link" size="sm|md|lg|icon" loading href?>`. `href` makes it a Next `<Link>`.
- `@/components/ui/layout` → `<Container size="default|narrow|wide">`, `<Section tone="ivory|paper|gold|ink">`, `<SectionHeading eyebrow title lead align="center|left" invert>`
- `@/components/ui/card` → `Card` (prop `hover`), `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `@/components/ui/badge` → `<Badge variant="neutral|gold|success|warning|danger|info|solid" dot>`
- `@/components/ui/field` → `Field` (label/hint/error wrapper), `Label`, `Input`, `Textarea`, `Select` (all forwardRef)
- `@/components/ui/photo` → `<Photo seed="kebab-string" aspect="square|4/3|3/4|3/2|16/9|21/9|portrait|fill" rounded label priority />` (deterministic gradient stand-in for photography; `aspect="fill"` + `className="absolute inset-0 h-full w-full"` for backgrounds), `<BlurImage src alt .../>`
- `@/components/ui/skeleton` → `Skeleton`, `CardSkeleton`, `TableSkeleton`
- `@/components/ui/avatar` → `<Avatar name size="sm|md|lg" />`
- `@/components/ui/empty-state` → `<EmptyState icon={LucideIcon} title description action />`
- `@/components/ui/breadcrumbs` → `<Breadcrumbs items={[{label, href?}]} />`
- `@/components/ui/reveal` → `<Reveal delay={ms} as="div">` scroll fade-in
- `@/components/ui/tabs` → `<Tabs tabs={[{value,label,count?}]} value onValueChange defaultValue size />`
- `@/components/site/page-hero` → `<PageHero eyebrow title lead breadcrumbs />` (inner-page header, offsets fixed header — use as first element on public sub-pages)
- Helpers `@/lib/utils`: `cn()`, `formatINR(n)`, `formatDate(iso)`, `initials(name)`
- Data `@/lib/data`: `eventTypes`, `portfolio`, `packages`, `processSteps`, `testimonials`, `team`, `stats`, `valueProps`, `venuePartners`

## Hard rules
- **lucide-react brand icons (Instagram, Facebook, Twitter, etc.) DO NOT EXIST** in this version — never import them. Use generic icons or inline SVG. Verify any icon name is a real lucide export.
- Any component using hooks/`onClick`/browser APIs must start with `"use client"`.
- Currency is INR (`formatINR`). Region: Delhi NCR, India. Brand: **Aurelia Events**.
- Public sub-pages start with `<PageHero>`; the fixed header needs ~`pt-30` of clearance (PageHero handles it).
- Use `Photo` with descriptive `seed` strings for all imagery. Reuse seeds from `@/lib/data` where a subject already exists.
- Keep tables/dense UIs for internal panels; keep public pages airy and image-forward.
