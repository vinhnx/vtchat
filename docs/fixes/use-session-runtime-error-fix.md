# useSession Runtime Error Fix

## Problem
The application was throwing a runtime error: `Error: useSession is not defined` in the ChatFooter component and other components.

## Root Cause
Several React components were using `useSession` or `useUser` hooks (which internally call `useSession`) without being marked as client components with the `'use client'` directive. This caused the components to be server-side rendered, but authentication hooks can only be used on the client side.

## Components Fixed
The following components were missing the `'use client'` directive and have been fixed:

1. **packages/common/components/chat-input/chat-footer.tsx**
   - Uses `useUser` hook
   - Added `'use client'` directive

2. **packages/common/components/chat-input/structured-output-button.tsx**
   - Uses `useSession` hook
   - Added `'use client'` directive

3. **packages/common/components/chat-input/document-upload-button.tsx**
   - Uses `useSession` hook
   - Added `'use client'` directive

4. **packages/common/components/chat-input/multi-modal-attachment-button.tsx**
   - Uses `useSession` hook
   - Added `'use client'` directive

5. **packages/common/components/chat-input/image-upload.tsx**
   - Uses `useSession` hook
   - Added `'use client'` directive

## Fix Applied
Added `'use client';` directive at the top of each component file that uses authentication hooks.

## Verification
- Development server now starts without runtime errors
- ChatFooter renders correctly for both logged-in and non-logged-in users
- All authentication-dependent components work as expected

## Note
Components that already had the `'use client'` directive were not affected:
- side-bar.tsx
- vemetric-payment-tracker.tsx  
- vemetric-chat-tracker.tsx

This fix ensures proper separation between server and client components in Next.js App Router.
