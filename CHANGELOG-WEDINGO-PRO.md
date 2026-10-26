# Wedingo PRO editor update

This update improves the template editor UI while preserving the existing Vue/Pinia store, template API calls, object schema, guest invitation view, and envelope implementation.

## Changes
- Reworked editor panels with a premium ivory/champagne visual style and responsive layouts.
- Added canvas background color, dimensions, optional background image URL, and an envelope-enabled toggle.
- Added image upload to the selected image object or as a new image object. To avoid oversized MongoDB documents, uploaded images are limited to 700 KB and stored as data URLs; for larger images use a hosted image URL.
- Added a built-in editable gold SVG ornament.
- Added font-family, letter-spacing, border color/width controls and a typewriter animation option.
- Localized editor controls into Russian.

## Deployment note
The uploaded source archive does not include a package lockfile. Install dependencies with `npm install` in `frontend-admin`, then run `npm run build`. The admin frontend must be deployed at its configured host/path separately from the guest frontend. This source archive does not contain production secrets or live database data.
