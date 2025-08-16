import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with links', () => {
        render(<Footer />);

        // Check for common footer elements
        expect(screen.getByText('Terms')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
        expect(screen.getByText('Docs')).toBeInTheDocument();
    });

    it('should have proper link hrefs', () => {
        render(<Footer />);

        const termsLink = screen.getByRole('link', { name: 'Terms' });
        const privacyLink = screen.getByRole('link', { name: 'Privacy' });
        const helpLink = screen.getByRole('link', { name: 'Help' });
        const docsLink = screen.getByRole('link', { name: 'Docs' });

        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(privacyLink).toHaveAttribute('href', '/privacy');
        expect(helpLink).toHaveAttribute('href', '/help');
        expect(docsLink).toHaveAttribute('href', '/docs');
    });
});
