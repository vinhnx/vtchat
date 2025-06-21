export const MATH_TOOL_NAMES = [
    'add',
    'subtract',
    'multiply',
    'divide',
    'exponentiate',
    'factorial',
    'isPrime',
    'squareRoot',
    'sin',
    'cos',
    'tan',
    'sqrt',
    'log',
    'exp',
] as const;

export const isMathTool = (toolName: string | undefined): boolean => {
    return !!toolName && MATH_TOOL_NAMES.includes(toolName as any);
};
