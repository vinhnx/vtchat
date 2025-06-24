import { tool, type Tool } from 'ai';
import { z } from 'zod';

type CalculatorTools =
    | 'add'
    | 'subtract'
    | 'multiply'
    | 'divide'
    | 'exponentiate'
    | 'factorial'
    | 'isPrime'
    | 'squareRoot'
    | 'sin'
    | 'cos'
    | 'tan'
    | 'sqrt'
    | 'log'
    | 'exp'
    | 'evaluateExpression'
    | 'abs'
    | 'floor'
    | 'ceil'
    | 'round'
    | 'min'
    | 'max'
    | 'getConstants'
    | 'asin'
    | 'acos'
    | 'atan'
    | 'sinh'
    | 'cosh'
    | 'tanh'
    | 'gcd'
    | 'lcm'
    | 'permutation'
    | 'combination'
    | 'mean'
    | 'median'
    | 'standardDeviation';

export const calculatorTools = (config?: {
    excludeTools?: CalculatorTools[];
}): Partial<Record<CalculatorTools, Tool>> => {
    const tools: Partial<Record<CalculatorTools, Tool>> = {
        add: tool({
            description: 'Add two numbers and return the result',
            parameters: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number'),
            }),
            execute: async ({ a, b }) => {
                return add(a, b);
            },
        }),
        subtract: tool({
            description: 'Subtract second number from first and return the result',
            parameters: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number'),
            }),
            execute: async ({ a, b }) => {
                return subtract(a, b);
            },
        }),
        multiply: tool({
            description: 'Multiply two numbers and return the result',
            parameters: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number'),
            }),
            execute: async ({ a, b }) => {
                return multiply(a, b);
            },
        }),
        divide: tool({
            description: 'Divide first number by second and return the result',
            parameters: z.object({
                a: z.number().describe('Numerator'),
                b: z.number().describe('Denominator'),
            }),
            execute: async ({ a, b }) => {
                return divide(a, b);
            },
        }),
        exponentiate: tool({
            description: 'Raise first number to the power of the second number',
            parameters: z.object({
                a: z.number().describe('Base'),
                b: z.number().describe('Exponent'),
            }),
            execute: async ({ a, b }) => {
                return exponentiate(a, b);
            },
        }),
        factorial: tool({
            description: 'Calculate the factorial of a number',
            parameters: z.object({
                n: z.number().int().describe('Number to calculate the factorial of'),
            }),
            execute: async ({ n }) => {
                return factorial(n);
            },
        }),
        isPrime: tool({
            description: 'Check if a number is prime',
            parameters: z.object({
                n: z.number().int().describe('Number to check if prime'),
            }),
            execute: async ({ n }) => {
                return isPrime(n);
            },
        }),
        squareRoot: tool({
            description: 'Calculate the square root of a number',
            parameters: z.object({
                n: z.number().describe('Number to calculate the square root of'),
            }),
            execute: async ({ n }) => {
                return squareRoot(n);
            },
        }),
        sin: tool({
            description: 'Calculate the sine of an angle in radians',
            parameters: z.object({
                n: z.number().describe('Angle in radians'),
            }),
            execute: async ({ n }) => {
                return sin(n);
            },
        }),
        cos: tool({
            description: 'Calculate the cosine of an angle in radians',
            parameters: z.object({
                n: z.number().describe('Angle in radians'),
            }),
            execute: async ({ n }) => {
                return cos(n);
            },
        }),
        tan: tool({
            description: 'Calculate the tangent of an angle in radians',
            parameters: z.object({
                n: z.number().describe('Angle in radians'),
            }),
            execute: async ({ n }) => {
                return tan(n);
            },
        }),
        sqrt: tool({
            description: 'Calculate the square root of a number (alias for squareRoot)',
            parameters: z.object({
                n: z.number().describe('Number to calculate the square root of'),
            }),
            execute: async ({ n }) => {
                return squareRoot(n);
            },
        }),
        log: tool({
            description: 'Calculate the natural logarithm (base e) of a number',
            parameters: z.object({
                n: z.number().describe('Number to calculate the logarithm of'),
            }),
            execute: async ({ n }) => {
                return log(n);
            },
        }),
        exp: tool({
            description: 'Calculate e raised to the power of a number',
            parameters: z.object({
                n: z.number().describe('Power to raise e to'),
            }),
            execute: async ({ n }) => {
                return exp(n);
            },
        }),
        evaluateExpression: tool({
            description: 'Evaluate a complete mathematical expression with proper order of operations (PEMDAS). Supports +, -, *, /, ^, (), sqrt(), sin(), cos(), tan(), log(), exp(), abs(), floor(), ceil(), round(), pi, e',
            parameters: z.object({
                expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 3 * 4", "sqrt(16) + sin(pi/2)", "(5 + 3) * 2^3")'),
            }),
            execute: async ({ expression }) => {
                return evaluateExpression(expression);
            },
        }),
        abs: tool({
            description: 'Calculate the absolute value of a number',
            parameters: z.object({
                n: z.number().describe('Number to get absolute value of'),
            }),
            execute: async ({ n }) => {
                return absoluteValue(n);
            },
        }),
        floor: tool({
            description: 'Round a number down to the nearest integer',
            parameters: z.object({
                n: z.number().describe('Number to floor'),
            }),
            execute: async ({ n }) => {
                return floor(n);
            },
        }),
        ceil: tool({
            description: 'Round a number up to the nearest integer',
            parameters: z.object({
                n: z.number().describe('Number to ceil'),
            }),
            execute: async ({ n }) => {
                return ceil(n);
            },
        }),
        round: tool({
            description: 'Round a number to the nearest integer',
            parameters: z.object({
                n: z.number().describe('Number to round'),
                decimals: z.number().int().optional().describe('Number of decimal places (default: 0)'),
            }),
            execute: async ({ n, decimals = 0 }) => {
                return roundNumber(n, decimals);
            },
        }),
        min: tool({
            description: 'Find the minimum value from a list of numbers',
            parameters: z.object({
                numbers: z.array(z.number()).describe('Array of numbers to find minimum from'),
            }),
            execute: async ({ numbers }) => {
                return minimum(numbers);
            },
        }),
        max: tool({
            description: 'Find the maximum value from a list of numbers',
            parameters: z.object({
                numbers: z.array(z.number()).describe('Array of numbers to find maximum from'),
            }),
            execute: async ({ numbers }) => {
                return maximum(numbers);
            },
        }),
        getConstants: tool({
            description: 'Get mathematical constants (pi, e, golden ratio, etc.)',
            parameters: z.object({
                constant: z.enum(['pi', 'e', 'goldenRatio', 'euler', 'sqrt2']).describe('Which constant to get'),
            }),
            execute: async ({ constant }) => {
                return getConstants(constant);
            },
        }),
        asin: tool({
            description: 'Calculate the arcsine (inverse sine) of a number in radians',
            parameters: z.object({
                n: z.number().describe('Number between -1 and 1'),
            }),
            execute: async ({ n }) => {
                return arcsine(n);
            },
        }),
        acos: tool({
            description: 'Calculate the arccosine (inverse cosine) of a number in radians',
            parameters: z.object({
                n: z.number().describe('Number between -1 and 1'),
            }),
            execute: async ({ n }) => {
                return arccosine(n);
            },
        }),
        atan: tool({
            description: 'Calculate the arctangent (inverse tangent) of a number in radians',
            parameters: z.object({
                n: z.number().describe('Number to calculate arctangent of'),
            }),
            execute: async ({ n }) => {
                return arctangent(n);
            },
        }),
        sinh: tool({
            description: 'Calculate the hyperbolic sine of a number',
            parameters: z.object({
                n: z.number().describe('Number to calculate hyperbolic sine of'),
            }),
            execute: async ({ n }) => {
                return hyperbolicSine(n);
            },
        }),
        cosh: tool({
            description: 'Calculate the hyperbolic cosine of a number',
            parameters: z.object({
                n: z.number().describe('Number to calculate hyperbolic cosine of'),
            }),
            execute: async ({ n }) => {
                return hyperbolicCosine(n);
            },
        }),
        tanh: tool({
            description: 'Calculate the hyperbolic tangent of a number',
            parameters: z.object({
                n: z.number().describe('Number to calculate hyperbolic tangent of'),
            }),
            execute: async ({ n }) => {
                return hyperbolicTangent(n);
            },
        }),
        gcd: tool({
            description: 'Calculate the Greatest Common Divisor (GCD) of two integers',
            parameters: z.object({
                a: z.number().int().describe('First integer'),
                b: z.number().int().describe('Second integer'),
            }),
            execute: async ({ a, b }) => {
                return greatestCommonDivisor(a, b);
            },
        }),
        lcm: tool({
            description: 'Calculate the Least Common Multiple (LCM) of two integers',
            parameters: z.object({
                a: z.number().int().describe('First integer'),
                b: z.number().int().describe('Second integer'),
            }),
            execute: async ({ a, b }) => {
                return leastCommonMultiple(a, b);
            },
        }),
        permutation: tool({
            description: 'Calculate permutations (nPr): number of ways to arrange r items from n items',
            parameters: z.object({
                n: z.number().int().describe('Total number of items'),
                r: z.number().int().describe('Number of items to arrange'),
            }),
            execute: async ({ n, r }) => {
                return permutation(n, r);
            },
        }),
        combination: tool({
            description: 'Calculate combinations (nCr): number of ways to choose r items from n items',
            parameters: z.object({
                n: z.number().int().describe('Total number of items'),
                r: z.number().int().describe('Number of items to choose'),
            }),
            execute: async ({ n, r }) => {
                return combination(n, r);
            },
        }),
        mean: tool({
            description: 'Calculate the arithmetic mean (average) of a list of numbers',
            parameters: z.object({
                numbers: z.array(z.number()).describe('Array of numbers to calculate mean of'),
            }),
            execute: async ({ numbers }) => {
                return arithmeticMean(numbers);
            },
        }),
        median: tool({
            description: 'Calculate the median (middle value) of a list of numbers',
            parameters: z.object({
                numbers: z.array(z.number()).describe('Array of numbers to find median of'),
            }),
            execute: async ({ numbers }) => {
                return medianValue(numbers);
            },
        }),
        standardDeviation: tool({
            description: 'Calculate the standard deviation of a list of numbers',
            parameters: z.object({
                numbers: z.array(z.number()).describe('Array of numbers to calculate standard deviation of'),
            }),
            execute: async ({ numbers }) => {
                return standardDeviation(numbers);
            },
        }),
    };

    for (const toolName in tools) {
        if (config?.excludeTools?.includes(toolName as CalculatorTools)) {
            delete tools[toolName as CalculatorTools];
        }
    }

    return tools;
};

function add(a: number, b: number) {
    return { result: a + b };
}

function subtract(a: number, b: number) {
    return { result: a - b };
}

function multiply(a: number, b: number) {
    return { result: a * b };
}

function divide(a: number, b: number) {
    if (b === 0) {
        return { error: 'Cannot divide by zero' };
    }
    try {
        return { result: a / b };
    } catch (error) {
        return { error };
    }
}

function exponentiate(a: number, b: number) {
    return { result: a ** b };
}

function factorial(n: number) {
    if (n < 0) {
        return { error: 'Factorial is not defined for negative numbers' };
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return { result };
}

function isPrime(n: number) {
    if (n <= 1) {
        return { result: false };
    }
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            return { result: false };
        }
    }
    return { result: true };
}

function squareRoot(n: number) {
    if (n < 0) {
        return { error: 'Square Root is not defined for negative numbers' };
    }
    return { result: Math.sqrt(n) };
}

function sin(n: number) {
    return { result: Math.sin(n) };
}

function cos(n: number) {
    return { result: Math.cos(n) };
}

function tan(n: number) {
    return { result: Math.tan(n) };
}

function log(n: number) {
    if (n <= 0) {
        return { error: 'Logarithm is not defined for non-positive numbers' };
    }
    return { result: Math.log(n) };
}

function exp(n: number) {
    return { result: Math.exp(n) };
}

// Expression evaluator function
function evaluateExpression(expression: string) {
    try {
        // Replace mathematical constants
        let expr = expression
            .replace(/\bpi\b/g, Math.PI.toString())
            .replace(/\be\b/g, Math.E.toString())
            .replace(/\^/g, '**'); // Replace ^ with ** for exponentiation

        // Replace math functions with JavaScript Math equivalents
        expr = expr
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/floor\(/g, 'Math.floor(')
            .replace(/ceil\(/g, 'Math.ceil(')
            .replace(/round\(/g, 'Math.round(');

        // Validate expression contains only allowed characters
        const allowedPattern = /^[0-9+\-*/().^ \tMath.sincoatlgexpabflorceiu]*$/;
        if (!allowedPattern.test(expr)) {
            return { error: 'Expression contains invalid characters' };
        }

        // Evaluate the expression safely
        const result = Function(`"use strict"; return (${expr})`)();
        
        if (typeof result !== 'number' || !isFinite(result)) {
            return { error: 'Expression did not evaluate to a valid number' };
        }
        
        return { 
            result, 
            originalExpression: expression,
            evaluatedExpression: expr 
        };
    } catch (error) {
        return { 
            error: `Invalid mathematical expression: ${error instanceof Error ? error.message : 'Unknown error'}`,
            originalExpression: expression 
        };
    }
}

// Basic utility functions
function absoluteValue(n: number) {
    return { result: Math.abs(n) };
}

function floor(n: number) {
    return { result: Math.floor(n) };
}

function ceil(n: number) {
    return { result: Math.ceil(n) };
}

function roundNumber(n: number, decimals: number = 0) {
    const factor = Math.pow(10, decimals);
    return { result: Math.round(n * factor) / factor };
}

function minimum(numbers: number[]) {
    if (numbers.length === 0) {
        return { error: 'Cannot find minimum of empty array' };
    }
    return { result: Math.min(...numbers) };
}

function maximum(numbers: number[]) {
    if (numbers.length === 0) {
        return { error: 'Cannot find maximum of empty array' };
    }
    return { result: Math.max(...numbers) };
}

// Mathematical constants
function getConstants(constant: 'pi' | 'e' | 'goldenRatio' | 'euler' | 'sqrt2') {
    const constants = {
        pi: Math.PI,
        e: Math.E,
        goldenRatio: (1 + Math.sqrt(5)) / 2, // φ
        euler: 0.5772156649015329, // Euler-Mascheroni constant γ
        sqrt2: Math.sqrt(2)
    };
    
    return { 
        result: constants[constant],
        name: constant,
        description: getConstantDescription(constant)
    };
}

function getConstantDescription(constant: string): string {
    const descriptions = {
        pi: 'The ratio of a circle\'s circumference to its diameter (π ≈ 3.14159)',
        e: 'Euler\'s number, base of natural logarithm (e ≈ 2.71828)',
        goldenRatio: 'Golden ratio, often denoted φ (phi) ≈ 1.618',
        euler: 'Euler-Mascheroni constant γ ≈ 0.5772',
        sqrt2: 'Square root of 2 ≈ 1.414'
    };
    return descriptions[constant as keyof typeof descriptions] || 'Mathematical constant';
}

// Advanced trigonometric functions
function arcsine(n: number) {
    if (n < -1 || n > 1) {
        return { error: 'Arcsine is only defined for values between -1 and 1' };
    }
    return { result: Math.asin(n) };
}

function arccosine(n: number) {
    if (n < -1 || n > 1) {
        return { error: 'Arccosine is only defined for values between -1 and 1' };
    }
    return { result: Math.acos(n) };
}

function arctangent(n: number) {
    return { result: Math.atan(n) };
}

// Hyperbolic functions
function hyperbolicSine(n: number) {
    return { result: Math.sinh(n) };
}

function hyperbolicCosine(n: number) {
    return { result: Math.cosh(n) };
}

function hyperbolicTangent(n: number) {
    return { result: Math.tanh(n) };
}

// Number theory functions
function greatestCommonDivisor(a: number, b: number) {
    a = Math.abs(Math.floor(a));
    b = Math.abs(Math.floor(b));
    
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return { result: a };
}

function leastCommonMultiple(a: number, b: number) {
    if (a === 0 || b === 0) {
        return { result: 0 };
    }
    
    const gcdResult = greatestCommonDivisor(a, b);
    if ('error' in gcdResult) {
        return gcdResult;
    }
    
    return { result: Math.abs(a * b) / gcdResult.result };
}

// Combinatorics functions
function permutation(n: number, r: number) {
    if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        return { error: 'n and r must be non-negative integers' };
    }
    if (r > n) {
        return { result: 0 };
    }
    
    let result = 1;
    for (let i = n; i > n - r; i--) {
        result *= i;
    }
    return { result };
}

function combination(n: number, r: number) {
    if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        return { error: 'n and r must be non-negative integers' };
    }
    if (r > n) {
        return { result: 0 };
    }
    if (r === 0 || r === n) {
        return { result: 1 };
    }
    
    // Use the smaller of r and n-r for efficiency
    r = Math.min(r, n - r);
    
    let result = 1;
    for (let i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }
    return { result: Math.round(result) };
}

// Statistical functions
function arithmeticMean(numbers: number[]) {
    if (numbers.length === 0) {
        return { error: 'Cannot calculate mean of empty array' };
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return { result: sum / numbers.length };
}

function medianValue(numbers: number[]) {
    if (numbers.length === 0) {
        return { error: 'Cannot find median of empty array' };
    }
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return { result: (sorted[mid - 1] + sorted[mid]) / 2 };
    } else {
        return { result: sorted[mid] };
    }
}

function standardDeviation(numbers: number[]) {
    if (numbers.length === 0) {
        return { error: 'Cannot calculate standard deviation of empty array' };
    }
    if (numbers.length === 1) {
        return { result: 0 };
    }
    
    const meanResult = arithmeticMean(numbers);
    if ('error' in meanResult) {
        return meanResult;
    }
    
    const mean = meanResult.result;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / (numbers.length - 1);
    
    return { result: Math.sqrt(variance) };
}
