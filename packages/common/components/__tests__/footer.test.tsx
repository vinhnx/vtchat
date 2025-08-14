import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with essential links only', () => {
        render(<Footer />);

        // Check for essential footer elements (max 4 items as per optimization)
        expect(screen.getByText('Terms')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
        expect(screen.getByText('VT+')).toBeInTheDocument();
        
        // Should not render non-essential links that were removed
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
        expect(screen.queryByText('About')).not.toBeInTheDocument();
        expect(screen.queryByText('FAQ')).not.toBeInTheDocument();
        expect(screen.queryByText('AI Glossary')).not.toBeInTheDocument();
        expect(screen.queryByText('AI Resources')).not.toBeInTheDocument();
        expect(screen.queryByText('X')).not.toBeInTheDocument();
    });

    it('should have proper link hrefs for essential links', () => {
        render(<Footer />);

        const termsLink = screen.getByRole('link', { name: 'Terms' });
        const privacyLink = screen.getByRole('link', { name: 'Privacy' });
        const helpLink = screen.getByRole('link', { name: 'Help' });
        const vtPlusLink = screen.getByRole('link', { name: 'VT+' });

        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(privacyLink).toHaveAttribute('href', '/privacy');
        expect(helpLink).toHaveAttribute('href', '/help');
        expect(vtPlusLink).toHaveAttribute('href', '/pricing');
    });

    it('should have optimized styling classes for mobile responsiveness', () => {
        const { container } = render(<Footer />);
        const footer = container.firstChild;

        // Check if footer has mobile-optimized styling classes
        expect(footer).toHaveClass('relative', 'z-0', 'py-2', 'pb-safe');
        
        // Check for responsive classes
        expect(footer).toHaveClass('sm:py-3', 'md:py-4');
    });

    it('should render copyright with current year', () => {
        render(<Footer />);
        
        const currentYear = new Date().getFullYear();
        const copyrightText = `© ${currentYear} VT, All rights reserved`;
        
        expect(screen.getByText(copyrightText)).toBeInTheDocument();
    });

    it('should have proper safe area handling for mobile', () => {
        const { container } = render(<Footer />);
        const footer = container.firstChild;

        // Check for safe area classes
        expect(footer).toHaveClass('pb-safe');
    });

    it('should have touch-friendly link sizing for mobile', () => {
        render(<Footer />);

        const links = screen.getAllByRole('link');
        
        // All essential links should be present
        expect(links).toHaveLength(4);
        
        // Links should have hover effects
        links.forEach(link => {
            expect(link).toHaveClass('duration-150', 'transition-colors');
        });
    });
});
