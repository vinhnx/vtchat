# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

-

integrate text-to-speech

--

--

fix settings modal layout check previous implementation

--

Add new Accessiblity settings: reduce motion -> disable all framer motion in the app

--
Please fix the following three issues in the VT Chat application:

1. **New Chat Button Hover Issue**: The "new chat" button appears to shrink when hovered. Fix this hover state behavior to maintain consistent sizing and provide appropriate visual feedback.

2. **Models Modal Mobile Responsiveness**: The models selection modal has width issues on mobile viewports - it doesn't fit properly on smaller screens. Adjust the modal's responsive design to ensure it displays correctly across all mobile device sizes.

3. **Build Error - Missing Export**: Fix the build error in `./apps/web/app/api/admin/analytics/route.ts` where the `resources` export is being imported but doesn't exist in the target module `@/lib/database/schema`. The error occurs at lines 5-12:

```typescript
import {
    feedback,
    providerUsage,
    resources, // <- This export doesn't exist
    sessions,
    users,
    vtplusUsage,
} from '@/lib/database/schema';
```

The build system suggests that `providerUsage` might be the intended import. Investigate the database schema file to determine the correct export name and update the import statement accordingly.

For each fix:

- First investigate the current implementation to understand the root cause
- Implement the appropriate solution following the project's coding standards
- Test the changes to ensure they work correctly
- Follow the project's UI/UX design principles (minimal design, no hard colors, clean typography)

--

please fix web search text streaming is jiggering and flashing streaming text, it should be smooth and continuous

--

on renderWrapupStep -> Wrapping up should not show a skeleton loader, it should show a text completion instead.

---

fix sourcegrid in chat thread to have a fixed height and horizontally scrollable content, currently it is vertically stacked
