# RTIK Indonesia Peduli - Footer Links Management

## Current State
App has 5 pages: Dashboard, Peta, Tanggapi, Publikasi, Admin Panel. Footer has a static "Informasi" section with 3 hardcoded text items: "Pemerintah Provinsi Aceh", "Badan Penanggulangan Bencana Daerah", "Banda Aceh, Aceh, Indonesia".

## Requested Changes (Diff)

### Add
- `FooterLink` type in backend: `{ id, label, url, order }` - label is display text, url is the hyperlink destination, order controls display sequence
- Backend CRUD functions: `getFooterLinks` (public, no auth), `addFooterLink` (admin only), `updateFooterLink` (admin only), `deleteFooterLink` (admin only)
- Default sample footer links initialized in `initializeSampleData`: 3 links replacing the existing hardcoded footer info items
- New "Link Footer" tab in Admin Panel with full add/edit/delete management for footer links
- Footer "Informasi" section renders dynamic footer links fetched from backend as clickable `<a>` elements with `target="_blank"`

### Modify
- Backend: add `FooterLink` type and CRUD operations
- `backend.d.ts`: add `FooterLink` interface and new functions
- `useQueries.ts`: add hooks for footer links (useGetFooterLinks, useAddFooterLink, useUpdateFooterLink, useDeleteFooterLink)
- `Layout.tsx`: footer "Informasi" section reads from backend and renders links dynamically
- `AdminPage.tsx`: add 4th tab "Link Footer" with table + add/edit/delete dialogs

### Remove
- Hardcoded static text items in footer "Informasi" section

## Implementation Plan
1. Regenerate backend with FooterLink type and CRUD functions
2. Update backend.d.ts with FooterLink interface and new methods
3. Add footer link hooks to useQueries.ts
4. Update Layout.tsx footer to fetch and display dynamic links
5. Add LinksTab component and tab trigger to AdminPage.tsx
