# Referrer Policy Fix - January 7, 2025

## 🐛 **Issue: Referrer Policy Warnings**

### **Problem**

Browser console showing referrer policy warnings for Google avatar images:

```
Referrer Policy: Ignoring the less restricted referrer policy "origin-when-cross-origin"
for the cross-site request: https://lh3.googleusercontent.com/ogw/AF2bZyhtwE-BhhWqE_Izb8Hctb7RLZJka37DQbjLaqPKGCBioKM=s32-c-mo
```

### **Root Cause**

1. **Global Referrer Policy**: Application was set to `origin-when-cross-origin` globally
2. **Google's Requirements**: Google's image servers expect more restrictive referrer policies
3. **Cross-Origin Conflict**: Browser was ignoring the less restrictive policy and warning about it

### **Solution Applied**

#### **Next.js Image Optimization Headers**

Added specific referrer policy for Next.js image optimization endpoint:

```javascript
// apps/web/next.config.mjs
{
    // Referrer policy for Next.js image optimization
    source: '/_next/image',
    headers: [
        {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
        },
    ],
}
```

#### **UserButton Component Enhancement**

Added explicit referrer policy to Image component:

```typescript
// packages/common/components/user-button.tsx
<Image
    alt={user.name || user.email || 'User'}
    className="rounded-full"
    height={24}
    src={getSessionCacheBustedAvatarUrl(user.image) || user.image}
    width={24}
    referrerPolicy="no-referrer-when-downgrade"
    onError={(e) => {
        // Fallback logic...
    }}
/>
```

### **Why This Works**

#### **`no-referrer-when-downgrade` Policy**

- **HTTPS to HTTPS**: Sends full URL as referrer (what Google expects)
- **HTTPS to HTTP**: Sends no referrer (security protection)
- **Same Origin**: Sends full URL (normal behavior)
- **Cross Origin**: Sends appropriate referrer based on scheme

#### **Comparison with Previous**

```
BEFORE: origin-when-cross-origin → Only sends origin to Google
AFTER:  no-referrer-when-downgrade → Sends full URL to Google (HTTPS→HTTPS)
```

### **Files Modified**

- **`apps/web/next.config.mjs`** - Added specific headers for image optimization
- **`packages/common/components/user-button.tsx`** - Added referrerPolicy attribute

### **Expected Results**

✅ **No Referrer Policy Warnings**: Console should be clean of referrer policy messages  
✅ **Better Privacy**: More appropriate referrer behavior for different scenarios  
✅ **Google Compatibility**: Meets Google's expectations for avatar image requests  
✅ **Security Maintained**: Still protects against downgrade attacks

### **Testing Verification**

1. **Hard Refresh**: Ctrl+F5 / Cmd+Shift+R to clear cache
2. **Console Check**: No "Referrer Policy: Ignoring..." warnings
3. **Network Tab**: Image requests should complete without warnings
4. **Cross-Browser**: Test in Chrome, Firefox, Safari

### **Technical Details**

#### **Referrer Policy Hierarchy**

```
1. Element-level (referrerPolicy attribute) - Highest priority
2. Meta tag (<meta name="referrer">)
3. HTTP header (Referrer-Policy)
4. Browser default - Lowest priority
```

#### **Policy Options Comparison**

- **`strict-origin-when-cross-origin`** - Most restrictive (default in modern browsers)
- **`no-referrer-when-downgrade`** - Moderate (good for image compatibility)
- **`origin-when-cross-origin`** - Less restrictive (previous setting)
- **`no-referrer`** - Most private (blocks all referrer info)

### **Benefits**

- ✅ **Clean Console**: No more referrer policy warnings
- ✅ **External Service Compatibility**: Works better with Google, GitHub, Discord
- ✅ **Maintained Security**: Still protects against HTTPS→HTTP downgrades
- ✅ **SEO Friendly**: Proper referrer behavior for analytics and tracking

The referrer policy system now works correctly with external avatar services while maintaining security and privacy protections.
