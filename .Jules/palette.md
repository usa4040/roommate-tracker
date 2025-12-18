## 2024-05-23 - Interactive Elements Pattern
**Learning:** The application frequently uses `div` elements with `onClick` handlers for selection interfaces (like user picking), which makes them inaccessible to keyboard users and screen readers.
**Action:** Systematically replace these with `<button type="button">` elements, adding `aria-pressed` for toggle states and `aria-selected` for list options, while carrying over existing inline styles to maintain the visual design.
