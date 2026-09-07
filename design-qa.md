# POS Tablet Checkout Design QA

- Source visual truth: `/private/var/folders/9k/_1bktg5x651c_n27k_1q9vkh0000gn/T/codex-clipboard-76f25571-ece3-44d9-bb07-c5783e5c6961.png`
- Implementation route: `http://localhost:3001/pos`
- Implementation screenshot: unavailable; the fresh browser session redirected to the public landing page because it did not have an authenticated session.
- Intended viewport: 1024 × 768 CSS pixels, device scale factor 1.
- Source pixels: 266 × 374 (cropped checkout-panel reference).
- Implementation pixels: unavailable for the authenticated POS state.
- State: empty cart, cash payment, no cash tender.

**Full-view comparison evidence**

The source shows the previous checkout panel compressed into one narrow column with weak grouping, very small hierarchy, and the charge action crowded against the viewport edge. The implementation was reorganized into a fixed checkout shell with an independently scrolling content area and a persistent action footer, but the authenticated state could not be captured for direct comparison.

**Focused region comparison evidence**

Focused rendered comparison was not possible because `/pos` redirected to `/` in the fresh verification browser session.

**Findings**

- [P1] Authenticated tablet state cannot be visually verified
  - Location: `/pos`, 1024 × 768.
  - Evidence: the source is authenticated POS UI; the verification session rendered the public landing page.
  - Impact: spacing, overflow, and touch-target changes cannot receive a trustworthy visual pass.
  - Fix: repeat the 1024 × 768 capture in an authenticated browser session.

**Implemented changes**

- Added a stronger order heading with cart icon and selected-item status.
- Grouped customer, payment, and tender controls into an `Order details` surface.
- Grouped totals into a distinct bordered summary surface.
- Added a helpful empty-cart message and next-step guidance.
- Increased touch area for `Clear` and the primary charge action.
- Separated the charge action into a persistent bottom footer while checkout content scrolls independently.

**Required fidelity surfaces**

- Fonts and typography: source hierarchy was small and compressed; implementation uses the existing app typography with a clearer heading, status, labels, and summary hierarchy. Render verification remains blocked.
- Spacing and layout rhythm: content is grouped into consistent cards with 12–16px spacing and a separate action footer. Render verification remains blocked.
- Colors and visual tokens: existing neutral, primary, success, and danger tokens are preserved. Render verification remains blocked.
- Image quality and asset fidelity: no raster imagery is used in this transactional panel; icons use the existing Phosphor icon system.
- Copy and content: all functional labels are preserved; empty state now explains how to begin an order.

**Implementation checklist**

- Re-open `/pos` in an authenticated tablet browser session.
- Capture the empty-cart and one-item states at 1024 × 768.
- Confirm the charge footer remains visible and no form or totals content is clipped.

**Comparison history**

- Initial source finding: checkout controls lacked grouping and the charge action was visually crowded at the bottom edge.
- Fix applied: introduced structured surfaces, independent content scrolling, and a persistent action footer.
- Post-fix evidence: production build passed; authenticated visual capture is unavailable.

final result: blocked
