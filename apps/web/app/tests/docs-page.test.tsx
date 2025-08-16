import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocsPage } from '../docs/page';

describe('DocsPage', () => {
    it('renders documentation heading', async () => {
        const Page = await DocsPage();
        render(Page);
        expect(
            await screen.findByText('VT (VTChat) Documentation'),
        ).toBeInTheDocument();
    });
});
