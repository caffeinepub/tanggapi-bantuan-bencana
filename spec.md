# Tanggapi Bantuan Bencana

## Current State

Full-stack ICP app (Motoko backend + React frontend). Features:
- Dashboard, Peta (OpenStreetMap), Tanggapi (laporan), Publikasi, Admin Panel (password-protected)
- Validasi Data Bencana (DisasterVictim + ValidationRecord)
- Penerima Bantuan Pasca Bencana (BantuanPenerima)
- Rekap PDF, Link Footer, User Management, Validator Management

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `addBantuanPenerima`: Remove admin/validator auth check -- make it open to all callers (including anonymous). Security is enforced at frontend via password panel. Keep `createdBy` from the data parameter (not override with caller).
- `updateBantuanPenerima`: Remove admin/validator auth check -- make it open to all callers.
- Keep `validasiStatus` from data parameter (not hardcode to "baru") so frontend can set the initial status.

### Remove
- Nothing

## Implementation Plan

1. In `addBantuanPenerima`: change caller check from `isAdminOrValidator(caller)` to allow all. Use `data.validasiStatus` instead of hardcoded "baru". Use `data.createdBy` instead of `caller`.
2. In `updateBantuanPenerima`: remove the auth check, allow all callers.
3. Keep all other functions exactly the same.
