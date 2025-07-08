# Alert Component Styling Update

## Changes Made

Updated the Alert component to use softer, more elegant colors instead of harsh red backgrounds.

### Before

The `destructive` variant used:

- `bg-destructive/10` which rendered as a harsh red background
- Strong red borders and text

### After

The `destructive` variant now uses:

- `bg-red-50/50` - A soft, translucent red background (50% opacity)
- `border-red-200` - Subtle red border
- `text-red-700` - Softer red text
- Proper dark mode variants with reduced opacity

### New Variants Added

1. **Info**: Soft blue styling for informational messages
2. **Success**: Soft green styling for success messages
3. **Warning**: Enhanced amber styling (previously existed but improved)

### Color Scheme

All variants now follow a consistent pattern:

- Light mode: `bg-{color}-50/50` (translucent background)
- Dark mode: `bg-{color}-950/20` (darker background with low opacity)
- Borders: `border-{color}-200` (light mode) / `border-{color}-800/50` (dark mode)
- Text: `text-{color}-700` (light mode) / `text-{color}-300` (dark mode)

### Usage Examples

```tsx
// Soft error alert
<Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>Something went wrong, but in a softer way.</AlertDescription>
</Alert>

// New info variant
<Alert variant="info">
    <Info className="h-4 w-4" />
    <AlertTitle>Information</AlertTitle>
    <AlertDescription>Here's some helpful information.</AlertDescription>
</Alert>

// New success variant
<Alert variant="success">
    <CheckCircle className="h-4 w-4" />
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Operation completed successfully!</AlertDescription>
</Alert>
```

### Benefits

1. **Better Visual Hierarchy**: Softer colors don't compete with content
2. **Improved UX**: Less jarring error messages
3. **Consistency**: All variants follow the same color pattern
4. **Accessibility**: Maintains good contrast while being gentler
5. **Dark Mode Support**: Proper dark mode variants with appropriate opacity
