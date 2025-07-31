---
applyTo: '**'
---

# shadcn/ui LLM UI Development Instructions (2025)

_Last updated: July 2025_

- Always use the fetch tool to look up the latest component usage, install name, and best practices directly from the official shadcn/ui documentation: https://ui.shadcn.com/docs/components
- Do not rely on what you think you know about shadcn/ui components, as they are frequently updated and improved. Your training data is outdated.
- For any shadcn/ui component, CLI command, or usage pattern, fetch the relevant page from the docs and follow the instructions there.

**Core Principles:**

- shadcn/ui components are open code: you are expected to read, modify, and extend them directly.
- Use the CLI (`pnpm dlx shadcn@latest add <component>`) to add or update components.
- Always import from the local `@/components/ui/<component>` path.
- Follow accessibility and composition best practices as described in the docs.

**Summary:**

> For all shadcn/ui work, always use the fetch tool to look up the latest component documentation and usage from https://ui.shadcn.com/docs/components. Do not rely on static instructions.
