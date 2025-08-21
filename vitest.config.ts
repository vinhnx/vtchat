import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [
            './vitest.setup.ts',
            './apps/web/app/tests/setup.ts',
            './packages/common/__tests__/setup.ts',
        ],
        include: [
            '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'apps/web/app/tests/**/*.test.ts',
            'packages/common/components/__tests__/**/*.test.tsx',
        ],
        testTimeout: 10_000,
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
            '**/apps/web/.next/**',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'coverage/**',
                'dist/**',
                '**/node_modules/**',
                '**/.next/**',
                '**/*.d.ts',
                '**/*.config.*',
                '**/apps/web/app/tests/**',
                'vitest.setup.ts',
            ],
        },
    },
});
