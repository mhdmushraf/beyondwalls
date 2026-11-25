# Beyond Walls — rules for anyone editing this app

## Screen states (required on every page)

No screen may ever be blank or a dead end. Every page and form handles all of these:

1. **Empty** — explain what goes here and give one primary action (`EmptyState` in `src/components/portal/ui.jsx`).
2. **Loading** — skeletons only, never spinners for page loads (`src/components/portal/Skeletons.jsx`).
3. **Error** — `ErrorState` with the cause in plain words, what to do, a Try again button and WhatsApp support. Never a bare "Something went wrong".
4. **Offline** — `OfflineBanner` (already in the layout). Lists come from cache; `useOrgEntity` create/update queue to the outbox and send on reconnect. Uploads and remote TV commands say clearly they need internet.
5. **Slow network** — `SlowHint` under the header while loading.
6. **No results** — say what was searched, and offer "Clear search" / "Show all".
7. **Permission denied** — `friendlyError` maps 403 to who can do it and how to ask.
8. **Session expired** — 401 dispatches `bw:session-expired`; `SessionExpiredDialog` signs in again and returns to the same page.
9. **Keep what they type** — `useDraft(key, value, setValue, { saved })` + `DraftBanner`; call `clear()` after a successful save.
10. **Validation + success** — `validate(schema, values)` with `rules` and `FieldError` under each field; `notifySuccess(title, next, action)` says what happens next. Errors use `notifyError(error, action, retry)`.

Helpers: `src/lib/states.js`, `src/components/states/StateViews.jsx`, `src/components/states/SessionAndPreview.jsx`.

Preview any state as an admin with `?state=empty|loading|error|offline|slow|expired|noresults` (or the floating switcher).

## Other rules
- Brand: violet #6F3FFD→#5A2DED, Inter + Readex Pro (Arabic). Use the `bw-*` classes in `src/index.css`.
- Org data: always through `useOrgEntity` / `usePortal`; RLS uses `org_member_user_ids`.

## Money & marketplace (server functions only)
- Prices, shares, VAT and invoice numbers are computed in `base44/functions/*` (marketplaceBook, bookingAction, directDeal, venuePayout, paymobCheckout, paymobWebhook). Never trust amounts from the browser.
- AdBooking, Campaign, Invoice, PayoutRequest, Notification are created by functions (service role); RLS blocks client writes.
- Venue share: Organization.commission_rate (platform %), admin-only field. Default from PlatformSettings.venue_share_pct.
- Notify people with `notifyUsers()` in `base44/shared/notify.ts` (in-app + Expo push). Ask Mushu before adding any email or WhatsApp sending.
- The Expo app (separate repo/zip `beyondwalls-mobile`) uses the same entities — keep field names stable.
