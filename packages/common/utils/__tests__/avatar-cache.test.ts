import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getCacheBustedAvatarUrl, getSessionCacheBustedAvatarUrl } from '../avatar-cache';

// Mock window and performance for testing
beforeAll(() => {
    Object.defineProperty(global, 'window', {
        value: {
            performance: {
                timeOrigin: 1234567890000,
            },
        },
        writable: true,
    });
});

describe('Avatar Cache Utils', () => {
    describe('getCacheBustedAvatarUrl', () => {
        it('should return undefined for null/undefined URLs', () => {
            expect(getCacheBustedAvatarUrl(null)).toBeUndefined();
            expect(getCacheBustedAvatarUrl(undefined)).toBeUndefined();
        });

        it('should add timestamp parameter to URL without query params', () => {
            const mockDate = 1640995200000; // Jan 1, 2022
            vi.spyOn(Date, 'now').mockReturnValue(mockDate);

            const url = 'https://example.com/avatar.jpg';
            const result = getCacheBustedAvatarUrl(url);

            expect(result).toBe(`${url}?_t=${mockDate}`);

            vi.restoreAllMocks();
        });

        it('should add timestamp parameter to URL with existing query params', () => {
            const mockDate = 1640995200000;
            vi.spyOn(Date, 'now').mockReturnValue(mockDate);

            const url = 'https://example.com/avatar.jpg?size=100';
            const result = getCacheBustedAvatarUrl(url);

            expect(result).toBe(`${url}&_t=${mockDate}`);

            vi.restoreAllMocks();
        });
    });

    describe('getSessionCacheBustedAvatarUrl', () => {
        it('should return undefined for null/undefined URLs', () => {
            expect(getSessionCacheBustedAvatarUrl(null)).toBeUndefined();
            expect(getSessionCacheBustedAvatarUrl(undefined)).toBeUndefined();
        });

        it('should add session ID parameter to URL without query params', () => {
            const url = 'https://example.com/avatar.jpg';
            const result = getSessionCacheBustedAvatarUrl(url);

            expect(result).toContain('?_sid=');
            expect(result).toStartWith(url);
        });

        it('should add session ID parameter to URL with existing query params', () => {
            const url = 'https://example.com/avatar.jpg?size=100';
            const result = getSessionCacheBustedAvatarUrl(url);

            expect(result).toContain('&_sid=');
            expect(result).toStartWith(url);
        });

        it('should use performance.timeOrigin for session cache busting', () => {
            const url = 'https://example.com/avatar.jpg';
            const result = getSessionCacheBustedAvatarUrl(url);

            expect(result).toBe(`${url}?_sid=1234567890000`);
        });

        it('should use daily cache busting for GitHub avatars', () => {
            const url = 'https://avatars.githubusercontent.com/u/123456?v=4';
            const result = getSessionCacheBustedAvatarUrl(url);
            const today = new Date().toISOString().split('T')[0];

            expect(result).toBe(`${url}&_d=${today}`);
        });

        it('should use daily cache busting for GitHub avatars without query params', () => {
            const url = 'https://avatars.githubusercontent.com/u/123456';
            const result = getSessionCacheBustedAvatarUrl(url);
            const today = new Date().toISOString().split('T')[0];

            expect(result).toBe(`${url}?_d=${today}`);
        });

        it('should use daily cache busting for Google avatars', () => {
            const url = 'https://lh3.googleusercontent.com/a/default-user=s96-c?v=4';
            const result = getSessionCacheBustedAvatarUrl(url);
            const today = new Date().toISOString().split('T')[0];

            expect(result).toBe(`${url}&_d=${today}`);
        });

        it('should use daily cache busting for Google avatars without query params', () => {
            const url = 'https://lh3.googleusercontent.com/a/default-user';
            const result = getSessionCacheBustedAvatarUrl(url);
            const today = new Date().toISOString().split('T')[0];

            expect(result).toBe(`${url}?_d=${today}`);
        });

        it('should handle different Google avatar subdomains', () => {
            const urls = [
                'https://lh3.googleusercontent.com/a/user123',
                'https://lh4.googleusercontent.com/a/user456',
                'https://lh5.googleusercontent.com/a/user789',
                'https://lh6.googleusercontent.com/a/user000',
            ];
            const today = new Date().toISOString().split('T')[0];

            urls.forEach((url) => {
                const result = getSessionCacheBustedAvatarUrl(url);
                expect(result).toBe(`${url}?_d=${today}`);
            });
        });
    });
});
