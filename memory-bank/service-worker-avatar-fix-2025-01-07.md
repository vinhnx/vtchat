# Service Worker Avatar Fix - January 7, 2025

## 🐛 **Issue Resolved: Avatar Images Not Loading**

### **Problem**

User avatar images from Google failing to load with error:

```
Failed to load 'https://lh3.googleusercontent.com/ogw/AF2bZyhtwE-BhhWqE_Izb8Hctb7RLZJka37DQbjLaqPKGCBioKM=s32-c-mo'.
A ServiceWorker passed a promise to FetchEvent.respondWith() that resolved with non-Response value 'undefined'.
sw.js:374:11
```

### **Root Cause Analysis** (Provided by Oracle)

1. **Next.js Image Optimization**: Avatars are requested through `/_next/image?url=<ENCODED_EXTERNAL_URL>&w=32&q=75` (same origin)

2. **Service Worker Misclassification**: `getStrategy()` didn't recognize these as external images because the request origin is our own site

3. **Wrong Cache Strategy**: Router classified requests as `{ strategy: 'stale-while-revalidate', cacheName: DYNAMIC }`

4. **Google Blocking**: Google blocks hot-linking from optimization endpoints intermittently → internal `fetch()` fails

5. **Undefined Response**: `staleWhileRevalidate()` catch path returned `null`, function fell through without return → resolved with `undefined`

6. **Browser Error**: `respondWith()` received `undefined` → "non-Response value" error → avatar never loaded

### **Solution Applied**

#### 1. **Bypass Next.js Image Optimizer**

```javascript
function getStrategy(request) {
    const url = new URL(request.url);

    // Skip Next.js image optimizer completely to avoid issues with external images
    if (url.pathname.startsWith('/_next/image')) {
        return null;
    }

    // ... rest of function
}
```

#### 2. **Hardened staleWhileRevalidate Method**

```javascript
static async staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await CacheManager.match(cacheName, request);
    const networkPromise = fetch(request)
        .then(async (networkResponse) => {
            if (networkResponse.ok) {
                await CacheManager.put(cacheName, request.clone(), networkResponse.clone());
            }
            return networkResponse;
        })
        .catch((err) => {
            log('Background update failed:', err.message);
            return null;
        });

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse = await networkPromise;
    if (networkResponse) {
        return networkResponse;
    }

    // NEW: Fallback to direct fetch without caching
    try {
        return await fetch(request);
    } catch (err) {
        log('Direct fetch fallback failed:', err.message);
    }

    // If all else fails, throw error (never return undefined)
    throw new Error('Network request failed and no cached response available');
}
```

### **Files Modified**

- **`apps/web/public/sw.js`** - Added Next.js image optimizer bypass and hardened staleWhileRevalidate

### **Expected Results**

✅ **Service Worker Bypass**: Next.js image optimization requests no longer intercepted by service worker  
✅ **Direct Browser Handling**: Avatar images loaded directly by browser/Next.js without interference  
✅ **No Undefined Responses**: staleWhileRevalidate always returns Response object or throws error  
✅ **Proper Avatar Display**: User avatars load correctly without console errors

### **Testing Instructions**

1. **Hard Refresh**: Ctrl+F5 or Cmd+Shift+R to reload service worker
2. **Check Browser Console**: Should see no "undefined Response" errors
3. **Verify Avatar Loading**: User avatars should display properly
4. **Monitor Network Tab**: `/_next/image` requests should complete successfully
5. **Check Service Worker**: In DevTools → Application → Service Workers should show active worker

### **Technical Details**

#### **Before Fix**

```
User Avatar Request → Next.js Image Optimizer → Service Worker Intercept →
staleWhileRevalidate → Google Blocks → fetch() fails → return null →
undefined Response → Browser Error → Avatar Fails
```

#### **After Fix**

```
User Avatar Request → Next.js Image Optimizer → Service Worker Bypass →
Direct Browser/Next.js Handling → Avatar Loads Successfully
```

### **Benefits**

- ✅ **Reliable Avatar Loading**: No more intermittent avatar failures
- ✅ **Better Performance**: Direct browser handling is faster for external images
- ✅ **Cleaner Console**: No service worker undefined response errors
- ✅ **Future-Proof**: Handles changes in Google's hot-linking policies
- ✅ **Preserved Caching**: Other caching strategies remain intact for internal assets

### **Related Components**

- **Avatar Cache Utility**: `packages/common/utils/avatar-cache.ts` (session-based cache busting)
- **User Button**: Components using avatars now display properly
- **Admin Interface**: Avatar columns in user management tables work correctly

The service worker now correctly handles external image requests while maintaining optimized caching for internal assets.
