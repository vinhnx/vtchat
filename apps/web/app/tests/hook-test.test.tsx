import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// Simple test component with hooks
function TestComponent() {
    const [count] = React.useState(0);
    return <div data-testid='test-component'>{count}</div>;
}

describe('Hook Test', () => {
    it('should render components with hooks', () => {
        const { getByTestId } = render(<TestComponent />);
        expect(getByTestId('test-component')).toBeInTheDocument();
    });
});
