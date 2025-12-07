import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepRenderer } from '../thread/step-renderer';

describe('StepRenderer Tool UI integration', () => {
    it('renders tool UI for running and completed tools', () => {
        const step = { id: 's1', status: 'PENDING' } as any;
        const toolCalls = {
            a: { type: 'tool-call', toolCallId: 'a', toolName: 'mockTool', args: { q: 1 } },
            b: { type: 'tool-call', toolCallId: 'b', toolName: 'doneTool', args: { x: true } },
            c: { type: 'tool-call', toolCallId: 'c', toolName: 'errorTool', args: { y: 'z' } },
        } as any;
        const toolResults = {
            b: {
                type: 'tool-result',
                toolCallId: 'b',
                toolName: 'doneTool',
                args: {},
                result: { ok: 1 },
            },
            c: {
                type: 'tool-result',
                toolCallId: 'c',
                toolName: 'errorTool',
                args: {},
                result: { error: 'Boom' },
            },
        } as any;

        render(
            <div>
                <StepRenderer
                    step={step}
                    toolCalls={toolCalls}
                    toolResults={toolResults}
                    showTools={true}
                />
            </div>,
        );

        // Types
        expect(screen.getByText('tool-mockTool')).toBeInTheDocument();
        expect(screen.getByText('tool-doneTool')).toBeInTheDocument();
        expect(screen.getByText('tool-errorTool')).toBeInTheDocument();

        // States
        expect(screen.getByText('Running')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();

        // Labels
        expect(screen.getAllByText('Parameters').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Result').length).toBeGreaterThan(0);
    });
});
