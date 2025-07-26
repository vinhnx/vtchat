# Large Files Report

Generated on: 2025-07-26 03:55:00

This report identifies files in the codebase that exceed the threshold of 800 lines.
Large files often benefit from refactoring into smaller, more focused modules.

## Files Exceeding Threshold

| File Path | Line Count | Recommendation |
|-----------|------------|----------------|
| /workspace/project/packages/common/store/chat.store.ts | 1970 | High priority refactoring needed |
| /workspace/project/packages/ai/workflow/utils.ts | 1461 | High priority refactoring needed |
| /workspace/project/packages/common/components/side-bar.tsx | 1019 | High priority refactoring needed |
| /workspace/project/packages/common/components/user-profile-settings.tsx | 910 | Medium priority refactoring |
| /workspace/project/packages/common/hooks/agent-provider.tsx | 888 | Medium priority refactoring |
| /workspace/project/apps/web/app/help/page.tsx | 831 | Medium priority refactoring |
| /workspace/project/packages/common/components/multi-model-usage-meter.tsx | 813 | Medium priority refactoring |
| /workspace/project/apps/web/app/help/faq/page.tsx | 802 | Medium priority refactoring |

## Summary

Total files exceeding threshold: 8

## Refactoring Guidelines

When refactoring large files, consider these approaches:

1. **Extract Types**: Move types to dedicated type files
2. **Extract Components**: Break down large UI components into smaller ones
3. **Create Custom Hooks**: Extract stateful logic into reusable hooks
4. **Separate Concerns**: Split different responsibilities into separate modules
5. **Implement Incrementally**: Test after each extraction to ensure functionality

For a detailed refactoring strategy, refer to the `/refactoring-plan.md` document.