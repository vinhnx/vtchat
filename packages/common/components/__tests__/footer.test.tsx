import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with link groups', () => {
        render(<Footer />);

        // Check for group titles
        expect(screen.getByText('Product')).toBeInTheDocument();
        expect(screen.getByText('Legal')).toBeInTheDocument();
        expect(screen.getByText('Support')).toBeInTheDocument();
        expect(screen.getByText('Resources')).toBeInTheDocument();

        // Check for some links in each group
        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Help' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'AI Glossary' })).toBeInTheDocument();
    });

    it('should have proper link hrefs', () => {
        render(<Footer />);

        const homeLink = screen.getByRole('link', { name: 'Home' });
        const termsLink = screen.getByRole('link', { name: 'Terms' });
        const contactLink = screen.getByRole('link', { name: 'Contact' });

        expect(homeLink).toHaveAttribute('href', '/');
        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(contactLink).toHaveAttribute('href', 'mailto:hello@vtchat.io.vn');
    });

    it('should render copyright text', () => {
        render(<Footer />);
        
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`${currentYear} VT\\. All rights reserved\\.`))).toBeInTheDocument();
    });
});
