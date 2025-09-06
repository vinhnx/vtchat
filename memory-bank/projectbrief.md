# Project Brief

## Core Requirements and Goals

This project involves refactoring and enhancing a web application. Key areas of focus include:

1. **Environment and Configuration Cleanup:**
   - Remove hardcoded environment checks.
   - Implement robust environment variable usage (e.g., `CREEM_ENVIRONMENT` or `NODE_ENV`).
   - Update relevant files like `payment.ts` and `creem.ts`.

2. **Authentication and Authorization Changes:**
   - Alert non-logged-in users when attempting to use chat input.
   - Enforce login for app usage.
   - Disable BYOK (Bring Your Own Key) for non-logged-in users.

3. **UI/UX Simplification & Component Updates:**
   - Update `UserTierBadge` to display plan names from `PlanSlug` enum.
   - Replace `TextShimmerComponent` with a simple `Label` component.
   - Adopt `shadcn/ui` styles and components more broadly.

## Project Scope

The scope includes modifications to frontend components, backend API handlers, configuration files, and utility functions across the `apps/web`, `packages/common`, and `packages/shared` directories.
