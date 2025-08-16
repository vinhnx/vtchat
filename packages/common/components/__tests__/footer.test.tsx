import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '../footer';

describe('Footer Component', () => {
    it('should render footer with all specified links', () => {
        render(<Footer />);

        // Check for all footer elements
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Terms')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('VT+')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
        expect(screen.getByText('Feedback')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('FAQ')).toBeInTheDocument();
        expect(screen.getByText('AI Glossary')).toBeInTheDocument();
        expect(screen.getByText('AI Resources')).toBeInTheDocument();
        expect(screen.getByText('X')).toBeInTheDocument();
    });

    it('should have proper link hrefs', () => {
        render(<Footer />);

        const homeLink = screen.getByRole('link', { name: 'Home' });
        const termsLink = screen.getByRole('link', { name: 'Terms' });
        const privacyLink = screen.getByRole('link', { name: 'Privacy' });
        const vtplusLink = screen.getByRole('link', { name: 'VT+' });
        const helloLink = screen.getByRole('link', { name: 'Hello' });
        const helpLink = screen.getByRole('link', { name: 'Help' });
        const feedbackLink = screen.getByRole('link', { name: 'Feedback' });
        const aboutLink = screen.getByRole('link', { name: 'About' });
        const faqLink = screen.getByRole('link', { name: 'FAQ' });
        const aiGlossaryLink = screen.getByRole('link', { name: 'AI Glossary' });
        const aiResourcesLink = screen.getByRole('link', { name: 'AI Resources' });
        const xLink = screen.getByRole('link', { name: 'X' });

        expect(homeLink).toHaveAttribute('href', '/');
        expect(termsLink).toHaveAttribute('href', '/terms');
        expect(privacyLink).toHaveAttribute('href', '/privacy');
        expect(vtplusLink).toHaveAttribute('href', '/pricing');
        expect(helloLink).toHaveAttribute('href', '/hello');
        expect(helpLink).toHaveAttribute('href', '/help');
        expect(feedbackLink).toHaveAttribute('href', 'https://vtchat.userjot.com');
        expect(aboutLink).toHaveAttribute('href', '/about');
        expect(faqLink).toHaveAttribute('href', '/faq');
        expect(aiGlossaryLink).toHaveAttribute('href', '/ai-glossary');
        expect(aiResourcesLink).toHaveAttribute('href', '/ai-resources');
        expect(xLink).toHaveAttribute('href', 'https://x.com/vtdotai');
    });

    it('should render copyright text', () => {
        render(<Footer />);

        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`${currentYear} VT, All rights reserved`)))
            .toBeInTheDocument();
    });
});
