### 📘 Project Best Practices

#### 1. Project Purpose
This project is an intelligent chat application powered by AI with advanced conversational capabilities. It is a Next.js application written in TypeScript.

#### 2. Project Structure
The project is a monorepo using bun workspaces.
- `apps/web`: The main Next.js web application.
- `packages/*`: Shared packages used across the monorepo.
  - `actions`: Reusable server-side actions.
  - `ai`: AI-related functionality.
  - `common`: Common utilities and types.
  - `mdx`: MDX-related utilities.
  - `orchestrator`: Orchestration logic.
  - `shared`: Shared code between the client and server.
  - `tailwind-config`: Shared Tailwind CSS configuration.
  - `typescript-config`: Shared TypeScript configuration.
  - `ui`: Shared UI components.

#### 3. Test Strategy
- **Framework**: Vitest is used for unit and integration testing.
- **Organization**: Tests are located in the `e2e` directory within the `apps/web` package.
- **Mocking**: No specific mocking strategy is evident from the file structure.
- **Philosophy**: The presence of `vitest.config.ts` and testing scripts in `package.json` suggests a commitment to testing, but the exact philosophy (unit vs. integration, coverage expectations) is not explicitly defined.

#### 4. Code Style
- **Language**: The project uses TypeScript, emphasizing type safety.
- **Naming Conventions**:
  - Components are likely PascalCase (e.g., `MyComponent`).
  - Files are kebab-case (e.g., `my-component.tsx`).
- **Formatting**: Prettier and Biome are used for code formatting, ensuring a consistent style.
- **Linting**: OXLint and Biome are used for linting, helping to catch potential errors and enforce best practices.

#### 5. Common Patterns
- **Monorepo**: The project uses a monorepo to manage its codebase, which is a common pattern for large-scale applications.
- **Server-Side Actions**: The `actions` package suggests the use of server-side actions for handling business logic.
- **UI Components**: The `ui` package indicates the use of a shared component library.

#### 6. Do's and Don'ts
- ✅ **Do**: Use the shared packages to promote code reuse and consistency.
- ✅ **Do**: Write tests for new features and bug fixes.
- ✅ **Do**: Follow the established code style and linting rules.
- ❌ **Don't**: Introduce new dependencies without careful consideration.
- ❌ **Don't**: Hardcode URLs; use environment variables instead.

#### 7. Tools & Dependencies
- **Framework**: Next.js
- **Language**: TypeScript
- **Testing**: Vitest
- **Styling**: Tailwind CSS
- **Linting**: OXLint, Biome
- **Formatting**: Prettier, Biome
- **Package Manager**: bun

#### 8. Other Notes
- The project is deployed using Docker and Fly.io.
- The project uses a variety of AI SDKs, including OpenAI, Google, and Anthropic.
- The project uses `drizzle-orm` for database access.
