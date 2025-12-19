## 2024-05-22 - Failing Tests in Layout
**Learning:** Components using `useAuth` (or other context hooks) must be wrapped in the corresponding Provider (e.g., `AuthProvider`) in tests.
**Action:** When testing components that depend on context, wrap them in a mock provider or the real provider with mocked values.

## 2024-05-22 - Semantic Buttons for Selection
**Learning:** Using `div`s with `onClick` for selection interfaces kills accessibility. Converting them to `button type="button"` with `aria-pressed` instantly fixes keyboard navigation and screen reader support without breaking visual design if styled correctly.
**Action:** Always use `<button>` for interactive elements, even if they look like cards or list items. Override default button styles as needed.
