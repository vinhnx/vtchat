import { beforeAll, beforeEach } from 'vitest';

beforeAll(() => {
    // Set required environment variables for tests
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    }
    process.env.VTPLUS_LIMIT_DR = '500';
    process.env.VTPLUS_LIMIT_PS = '800';
});

beforeEach(() => {
    // Ensure environment variables are set for each test
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    }
});
