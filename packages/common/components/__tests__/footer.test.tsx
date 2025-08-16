import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with links', () => {
        render(<Footer />);

        // Check for common footer elements
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Terms')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
        expect(screen.getByText('FAQ')).toBeInTheDocument();
        expect(screen.getByText('VT+')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should have proper link hrefs', () => {
        render(<Footer />);

        const homeLink = screen.getByRole('link', { name: 'Home' });
        const aboutLink = screen.getByRole('link', { name: 'About' });
        const termsLink = screen.getByRole('link', { name: 'Terms' });
        const privacyLink = screen.getByRole('link', { name: 'Privacy' });
        const helpLink = screen.getByRole('link', { name: 'Help' });
        const faqLink = screen.getByRole('link', { name: 'FAQ' });
        const vtplusLink = screen.getByRole('link', { name: 'VT+' });
        const contactLink = screen.getByRole('link', { name: 'Contact' });

        expect(homeLink).toHaveAttribute('href', '/');
        expect(aboutLink).toHaveAttribute('href', '/about');
        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(privacyLink).toHaveAttribute('href', '/privacy');
        expect(helpLink).toHaveAttribute('href', '/help');
        expect(faqLink).toHaveAttribute('href', '/faq');
        expect(vtplusLink).toHaveAttribute('href', '/pricing');
        expect(contactLink).toHaveAttribute('href', 'mailto:hello@vtchat.io.vn');
    });

    it('should render copyright text', () => {
        render(<Footer />);
        
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`${currentYear} VT, All rights reserved`))).toBeInTheDocument();
    });
});
