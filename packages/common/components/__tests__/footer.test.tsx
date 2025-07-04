import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with links', () => {
        render(<Footer />);

        // Check for common footer elements
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText('Help Center')).toBeInTheDocument();
    });

    it('should have proper link hrefs', () => {
        render(<Footer />);

        const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
        const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
        const faqLink = screen.getByRole('link', { name: 'Help Center' });

        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(privacyLink).toHaveAttribute('href', '/privacy');
        expect(faqLink).toHaveAttribute('href', '/faq');
    });

    it('should have appropriate styling classes', () => {
        const { container } = render(<Footer />);
        const footer = container.firstChild;

        // Check if footer has expected styling classes
        expect(footer).toHaveClass('flex', 'w-full', 'flex-col', 'items-center', 'justify-center');
    });
});
