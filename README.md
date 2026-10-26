# Event Invitation SaaS — Production-Ready Architecture

**Canva + Tilda style Online Event Invitation Constructor**  
Mobile-first wedding & event invitations with GSAP animations, interactive intros, and data-driven canvas.

## Architecture Overview

```
event-invitation-saas/
├── backend/                 # Node.js + Express + MongoDB
├── frontend-admin/          # Vue 3 + Konva.js Canvas Editor (Admin Panel)
├── frontend-guest/          # Vue 3 + GSAP Guest Landing Page
└── shared/                  # Shared TypeScript types & JSON schemas
```

### Core Principles

1. **Data-Driven Canvas Architecture** — Everything is a JSON schema. Templates and invitations are pure data.
2. **Separation of Concerns** — Admin creates immutable design structure. Client only fills data placeholders.
3. **Mobile-First Rendering** — Canvas fixed at 390×844 (iPhone 14/15 proportion). Guest view is fully responsive.
4. **GSAP-Powered Animations** — Scroll-triggered, intro, and auto-scroll effects.
5. **Audio Unlock Strategy** — User interaction on intro screen unlocks HTML5 Audio (bypasses iOS Safari autoplay policy).

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7+
- pnpm / npm / yarn

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit MONGO_URI, JWT_SECRET, CDN_BASE_URL
npm install
npm run dev
```

### 2. Admin Panel (Canvas Editor)

```bash
cd frontend-admin
npm install
npm run dev
```

### 3. Guest View

```bash
cd frontend-guest
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/api/public/i/:slug`           | Public invitation (merged template + client data) |
| POST   | `/api/public/i/:slug/rsvp`      | Submit RSVP                          |
| POST   | `/api/admin/assets`             | Register new asset (CDN/S3 URL)      |
| CRUD   | `/api/admin/templates`          | Template management                  |
| CRUD   | `/api/admin/invitations`        | Invitation instances                 |

---

## Key Architectural Decisions

### 1. JSON Schema as Single Source of Truth
Templates store a complete `objects[]` array with absolute positioning, styles, animations and placeholders (`{{groom}}`, `{{bride}}`, `{{date}}`...).  
At render time the Guest View replaces placeholders and mounts interactive widgets.

### 2. Audio Autoplay Bypass
iOS Safari (and most browsers) block autoplay.  
Solution: The interactive Intro (envelope / jewelry box) is the first user gesture.  
On `click`/`touchstart` we:
1. Play a silent or real audio element → unlocks the AudioContext.
2. Run GSAP unseal animation.
3. Fade out intro and start auto-scroll + scroll-triggered animations.

### 3. Canvas Editor (Admin)
Uses **Konva.js** (or Fabric.js alternative) on a fixed 390×844 stage.  
Elements are pure data objects that can be exported/imported as JSON.

### 4. Performance
- Guest view is a static SPA that fetches one JSON payload.
- All heavy assets (images, video, audio) are served from CDN.
- GSAP ScrollTrigger is used with `once: true` where possible.

---

## Database Entities

- **Asset** — Media library (frames, ornaments, backgrounds, audio, video)
- **Template** — Design created in Admin Canvas
- **Invitation** — Client instance of a template + filled data
- **GuestResponse** — RSVP records

See `backend/src/models/` for full Mongoose schemas.

---

## License
MIT — Built for production use.
