# PDF.js Worker CDN Migration

- Removed large `apps/web/public/pdf.worker.min.js` from repository.
- Centralized PDF.js worker configuration in `packages/common/constants/pdf-worker.ts`.
- Updated structured extraction utilities to load worker from CDN.
- Added `.gitignore` entry to prevent worker file reintroduction.
