# Streamdown Upgrade to 1.2.0

- Upgraded `streamdown` to `^1.2.0` in `apps/web/package.json` and `packages/common/package.json`.
- Verified API compatibility with our `Response` wrapper (`packages/common/components/ai-elements/response.tsx`).
- Global styles still reference `@source "../node_modules/streamdown/dist/index.js"` and remain valid.
- Ran `bun install` to refresh the lockfile.
- Attempted `bun run build`; Next.js build failed in sandbox with "The service was stopped" (environment-related). Recommend verifying locally.

Next steps
- Run `bun run build` locally to validate.
- On approval, deploy with `./deploy-fly.sh --auto --version patch`.
