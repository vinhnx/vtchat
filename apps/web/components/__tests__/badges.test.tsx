import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BadgesSection, AiToolsBadge, GoodFirmsBadge } from '../badges';

describe('Badge Components', () => {
  describe('BadgesSection', () => {
    it('renders without crashing', () => {
      render(<BadgesSection />);
      expect(screen.getByLabelText(/recognition and community badges/i)).toBeInTheDocument();
    });

    it('contains description text', () => {
      render(<BadgesSection />);
      expect(screen.getByText(/VT is recognized by leading AI and software directories/i)).toBeInTheDocument();
    });
  });

  describe('AiToolsBadge', () => {
    it('renders with correct link', () => {
      render(<AiToolsBadge />);
      const link = screen.getByLabelText(/VT featured on AI Tools directory/i);
      expect(link).toHaveAttribute('href', expect.stringContaining('aitools.inc'));
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('GoodFirmsBadge', () => {
    it('renders with correct link', () => {
      render(<GoodFirmsBadge />);
      const link = screen.getByLabelText(/VT featured on GoodFirms Chatbot Software directory/i);
      expect(link).toHaveAttribute('href', 'https://www.goodfirms.co/chatbot-software/');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('has proper accessibility attributes', () => {
      render(<GoodFirmsBadge />);
      const link = screen.getByLabelText(/VT featured on GoodFirms Chatbot Software directory/i);
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
