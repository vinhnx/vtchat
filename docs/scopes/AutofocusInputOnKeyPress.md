# Autofocus Input on Any Key Press

## Purpose & User Problem

Users often need to quickly start typing in the chat input, but if the input is not focused, their keystrokes are lost or ignored. This leads to frustration and increases the chance of input errors. Automatically focusing the input when any key is pressed (and the input is not already focused) will save time and reduce user error.

## Success Criteria

- When the user presses any key (except when typing in another input/textarea or using system shortcuts), the main chat input is focused automatically.
- The feature works across all supported browsers and platforms.
- No interference with accessibility or keyboard navigation.
- No focus-stealing when the user is intentionally interacting with other UI elements (e.g., modals, dropdowns, forms).
- No regression in existing input focus/blur logic.

## Scope & Constraints

- Applies only to the main chat input in the chat UI.
- Should not override focus if the user is already typing in another input or textarea.
- Should not trigger on modifier keys (Ctrl, Alt, Meta, Shift) or when using system/browser shortcuts.
- Should be implemented in a reusable and maintainable way (preferably as a custom React hook or utility).
- Must follow project code style and architectural guidelines (TypeScript, 4-space indent, named exports, etc.).

## Technical Considerations

- Use React refs to control input focus.
- Use a global keydown event listener, with proper cleanup.
- Check document.activeElement to avoid unnecessary focus calls.
- Consider edge cases: overlays, modals, mobile keyboards, accessibility.
- Ensure no performance impact (debounce if needed).

## Out of Scope

- Autofocus for non-chat inputs (e.g., search bars, settings forms).
- Changes to input styling or placeholder text.
- Any changes to mobile-specific input behavior unless required for parity.

---

**Questions for user:**

1. Should this apply only to the main chat input, or to all text inputs?
2. Should it work on mobile as well, or desktop only?
3. Any exceptions or special cases to consider?

---

Please review and let me know if this captures your intent or if any changes are needed.
