# Architecture Deep Dive

## 1. Data-Driven Canvas Pipeline

```
Admin Canvas Editor
       │
       ▼ (Save JSON)
   Template Document (MongoDB)
       │
       ▼ (Client fills form)
   Invitation Document (clientData + templateId)
       │
       ▼ GET /api/public/i/:slug
   mergeTemplateWithClientData()
       │
       ▼
   Guest View SPA
       │
       ├── IntroEnvelope (user gesture → unlock audio)
       ├── CanvasObject[] (absolute positioned + GSAP ScrollTrigger)
       └── Widgets (Countdown, Map, RSVP, DressCode)
```

## 2. Audio Unlock Strategy (iOS Safari Bypass)

Browsers (especially iOS Safari) require a **user gesture** before any audio can play.

**Our solution:**

1. The very first interaction is the **Intro Envelope** click/tap.
2. Inside that same event handler we call `audio.play()`.
3. Once the promise resolves (or even if it rejects), the AudioContext is unlocked for the lifetime of the page.
4. Subsequent play/pause works without further gestures.

This is the only reliable cross-browser pattern.

## 3. JSON → DOM Rendering

Each `CanvasObject` becomes a single absolutely-positioned `<div>`:

```html
<div style="position:absolute; left:Xpx; top:Ypx; width:Wpx; height:Hpx; z-index:Z">
  <!-- text | img | video | widget component -->
</div>
```

GSAP ScrollTrigger is attached on mount with `once: true` for performance.

## 4. Scalability Notes

- **Assets** live on CDN / S3. Backend only stores metadata + URL.
- **Templates** are immutable after publish (or versioned).
- **Invitations** are lightweight documents that only store client data + template reference.
- Guest view is a pure SPA that fetches one JSON payload — perfect for CDN caching of the static assets.
- RSVP writes are rate-limited and can be moved to a queue later.

## 5. Future Extensions

- Real-time collaborative editing (Yjs / Liveblocks)
- AI template generation
- Multi-language placeholders
- Analytics (open rate, scroll depth, RSVP funnel)
- Payment / premium templates
