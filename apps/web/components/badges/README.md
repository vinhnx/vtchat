# Badge Components

This directory contains badge components for displaying VT's recognition and community presence.

## Components

### BadgesSection

The main container component that organizes all badges in a responsive layout.

**Features:**

- Responsive design with proper spacing
- Consistent hover animations
- Accessibility support
- Performance optimizations

### AiToolsBadge

Displays the AI Tools directory badge with external SVG loading.

**Features:**

- External SVG loading with error handling
- Loading states with skeleton animation
- Lazy loading for performance
- Proper accessibility attributes

### GoodFirmsBadge

Displays the GoodFirms directory badge with local SVG and fallback.

**Features:**

- Local SVG loading with fallback text badge
- Error handling with graceful degradation
- Loading states with skeleton animation
- Optimized for large SVG files

## Performance Optimizations

1. **Lazy Loading**: All badges use `loading="lazy"` for better initial page load
2. **Error Handling**: Graceful fallbacks when images fail to load
3. **Loading States**: Skeleton animations prevent layout shift
4. **Image Optimization**: Proper sizing and quality settings
5. **CSS Containment**: Layout and style containment for better performance

## Usage

```tsx
import { BadgesSection } from '@/components/badges-section';

// Use in your component
<BadgesSection className='my-custom-class' />;
```

## File Structure

```
components/
├── badges-section.tsx      # Main badges container
├── aitools-badge.tsx       # AI Tools badge
├── goodfirms-badge.tsx     # GoodFirms badge
└── __tests__/
    └── badges.test.tsx     # Component tests
```

## Accessibility

All badge components include:

- Proper ARIA labels
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly alt text

## Testing

Run tests with:

```bash
bun test components/__tests__/badges.test.tsx
```
