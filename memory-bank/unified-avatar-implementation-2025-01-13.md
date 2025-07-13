# Unified Avatar Implementation - January 13, 2025

## Overview

Successfully created and implemented a unified Avatar component that combines `Avatar`, `AvatarFallback`, and `AvatarImage` into a single, easy-to-use component across the entire application.

## Problem Solved

Previously, the codebase had inconsistent avatar implementations:

- Some components used the legacy `AvatarLegacy` component
- Some used manual `Avatar + AvatarImage + AvatarFallback` combinations
- Some had simple div fallbacks
- Error handling and cache busting was inconsistent

## Solution Implemented

### 1. Created UnifiedAvatar Component

**File**: `packages/ui/src/components/avatar.tsx`

**Features**:

- ✅ **Single Component**: Combines all three Radix Avatar primitives
- ✅ **Enhanced Props**: Smart initials generation, error handling, cache busting support
- ✅ **Multiple Sizes**: `xs`, `sm`, `md`, `lg`, `xl` with proper sizing
- ✅ **Smart Initials**: Handles full names (takes first letters of first two words) and emails
- ✅ **Error Handling**: Built-in `onImageError` callback support
- ✅ **Accessibility**: Proper alt text and ARIA attributes
- ✅ **TypeScript**: Fully typed with comprehensive prop options

```tsx
export type UnifiedAvatarProps = {
    /** Display name for fallback and alt text */
    name: string;
    /** Avatar image source URL */
    src?: string | null | undefined;
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Additional CSS classes */
    className?: string;
    /** Image alt text (defaults to name) */
    alt?: string;
    /** Referrer policy for external images */
    referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
    /** Error handler for failed image loads */
    onImageError?: () => void;
    /** Custom fallback content (overrides default initials) */
    fallback?: React.ReactNode;
};
```

### 2. Updated All Components to Use UnifiedAvatar

#### ✅ Sidebar Component

**File**: `packages/common/components/side-bar.tsx`

**Before**:

```tsx
import { AvatarLegacy as Avatar } from '@repo/ui';
<Avatar
    name={user?.name || user?.email || 'User'}
    size="sm"
    src={getSessionCacheBustedAvatarUrl(user?.image) || undefined}
/>;
```

**After**:

```tsx
import { UnifiedAvatar } from '@repo/ui';
<UnifiedAvatar
    name={user?.name || user?.email || 'User'}
    size="sm"
    src={getSessionCacheBustedAvatarUrl(user?.image) || undefined}
    onImageError={() => {
        log.warn('Avatar failed to load in sidebar, using fallback initials');
    }}
/>;
```

#### ✅ User Button Component

**File**: `packages/common/components/user-button.tsx`

**Before**:

```tsx
<Avatar className="h-6 w-6">
    <AvatarImage src={getSessionCacheBustedAvatarUrl(user.image)} alt={user.name || 'User'} />
    <AvatarFallback className="text-xs">
        {(user.name || user.email)?.[0]?.toUpperCase() ?? 'U'}
    </AvatarFallback>
</Avatar>
```

**After**:

```tsx
<UnifiedAvatar
    name={user.name || user.email || 'User'}
    src={getSessionCacheBustedAvatarUrl(user.image)}
    size="xs"
    className="h-6 w-6"
/>
```

#### ✅ User Profile Settings

**File**: `packages/common/components/user-profile-settings.tsx`

**Before**: Simple div with initials fallback

**After**:

```tsx
<UnifiedAvatar
    name={session.user.name || session.user.email || 'User'}
    src={getSessionCacheBustedAvatarUrl(session.user.image)}
    size="lg"
    className="border-border/20 border-2"
    onImageError={() => {
        log.warn(
            {
                avatarUrl: session.user.image,
                userEmail: session.user.email,
            },
            'Avatar failed to load in profile settings, using fallback initials'
        );
    }}
/>
```

#### ✅ Navigation User Component

**File**: `packages/common/components/dashboard/nav-user.tsx`

**Before**:

```tsx
<Avatar className="h-8 w-8 rounded-lg grayscale">
    <AvatarImage src={getSessionCacheBustedAvatarUrl(user.avatar) || user.avatar} alt={user.name} />
    <AvatarFallback className="rounded-lg">
        {user.name
            .split(' ')
            .map(n => n[0])
            .join('')}
    </AvatarFallback>
</Avatar>
```

**After**:

```tsx
<UnifiedAvatar
    name={user.name}
    src={getSessionCacheBustedAvatarUrl(user.avatar) || user.avatar}
    size="md"
    className="h-8 w-8 rounded-lg grayscale"
/>
```

## Technical Benefits

### 1. Code Consistency

- ✅ Single import across all components
- ✅ Consistent API and behavior
- ✅ Unified error handling approach
- ✅ Standardized cache busting integration

### 2. Enhanced Features

- ✅ **Smart Initials**: Automatically generates proper initials from names and emails
- ✅ **Multiple Sizes**: Comprehensive size system with proper text scaling
- ✅ **Error Logging**: Structured logging with Pino for failed avatar loads
- ✅ **Accessibility**: Proper alt text and ARIA compliance
- ✅ **Cache Busting**: Seamless integration with `getSessionCacheBustedAvatarUrl`

### 3. Developer Experience

- ✅ **Single Component**: No need to compose multiple Avatar primitives
- ✅ **TypeScript Support**: Comprehensive prop types and intellisense
- ✅ **Flexible Styling**: Custom className support while maintaining defaults
- ✅ **Backward Compatibility**: `AvatarLegacy` still available for gradual migration

## Size Mapping

```tsx
const sizeClasses = {
    xs: 'h-6 w-6 min-w-6',
    sm: 'h-7 w-7 min-w-7',
    md: 'h-8 w-8 min-w-8',
    lg: 'h-12 w-12 min-w-12',
    xl: 'h-16 w-16 min-w-16',
};

const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
};
```

## Initials Generation Logic

```tsx
const getInitials = (name: string): string => {
    if (!name) return '?';

    // Handle email addresses
    if (name.includes('@')) {
        return name.charAt(0).toUpperCase();
    }

    // Handle full names - take first letter of first two words
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }

    return name.charAt(0).toUpperCase();
};
```

## Build Verification

✅ **Build Success**: Project builds without errors
✅ **Code Formatting**: All code formatted with Biome
✅ **Type Safety**: Full TypeScript compliance
✅ **Linting**: No linting errors

## Usage Examples

### Basic Usage

```tsx
<UnifiedAvatar name="John Doe" src="https://example.com/avatar.jpg" size="md" />
```

### With Error Handling

```tsx
<UnifiedAvatar
    name="Jane Smith"
    src={getSessionCacheBustedAvatarUrl(user.image)}
    size="lg"
    onImageError={() => log.warn('Avatar failed to load')}
/>
```

### Custom Styling

```tsx
<UnifiedAvatar
    name="User Name"
    src={avatarUrl}
    size="sm"
    className="border-2 border-blue-500 grayscale"
/>
```

## Future Improvements

1. **Avatar Upload**: Could add built-in upload functionality
2. **Caching Strategy**: Could implement more sophisticated caching
3. **Gradients**: Could add gradient fallback options
4. **Status Indicators**: Could add online/offline status indicators

## Files Modified

- ✅ `packages/ui/src/components/avatar.tsx` - Created UnifiedAvatar component
- ✅ `packages/common/components/side-bar.tsx` - Updated to use UnifiedAvatar
- ✅ `packages/common/components/user-button.tsx` - Updated to use UnifiedAvatar
- ✅ `packages/common/components/user-profile-settings.tsx` - Updated to use UnifiedAvatar
- ✅ `packages/common/components/dashboard/nav-user.tsx` - Updated to use UnifiedAvatar

The unified Avatar implementation significantly improves code consistency, developer experience, and maintainability across the entire application while providing enhanced features and better error handling.
