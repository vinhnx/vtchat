import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with link groups', () => {
        render(<Footer />);

        // Check for some links in each group (desktop version)
        const links = screen.getAllByRole('link', { name: 'Home' });
        expect(links.length).toBeGreaterThan(0);
        
        const termsLinks = screen.getAllByRole('link', { name: 'Terms' });
        expect(termsLinks.length).toBeGreaterThan(0);
        
        const helpLinks = screen.getAllByRole('link', { name: 'Help' });
        expect(helpLinks.length).toBeGreaterThan(0);
    });

    it('should have proper link hrefs', () => {
        render(<Footer />);

        // Check desktop version links
        const allHomeLinks = screen.getAllByRole('link', { name: 'Home' });
        const homeLink = allHomeLinks[0]; // Get the first one (desktop)
        
        const allTermsLinks = screen.getAllByRole('link', { name: 'Terms' });
        const termsLink = allTermsLinks[0];
        
        const allContactLinks = screen.getAllByRole('link', { name: 'Contact' });
        const contactLink = allContactLinks[0];

        expect(homeLink).toHaveAttribute('href', '/');
        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(contactLink).toHaveAttribute('href', 'mailto:hello@vtchat.io.vn');
    });

    it('should render copyright text', () => {
        render(<Footer />);
        
        const currentYear = new Date().getFullYear();
        const copyrightTexts = screen.getAllByText(new RegExp(`${currentYear} VT\\. All rights reserved\\.`));
        expect(copyrightTexts.length).toBeGreaterThan(0);
    });
});
