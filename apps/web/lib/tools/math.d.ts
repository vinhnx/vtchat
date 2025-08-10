import { type Tool } from "ai";
type CalculatorTools = "add" | "subtract" | "multiply" | "divide" | "exponentiate" | "factorial" | "isPrime" | "squareRoot" | "sin" | "cos" | "tan" | "sqrt" | "log" | "exp" | "evaluateExpression" | "abs" | "floor" | "ceil" | "round" | "min" | "max" | "getConstants" | "asin" | "acos" | "atan" | "sinh" | "cosh" | "tanh" | "gcd" | "lcm" | "permutation" | "combination" | "mean" | "median" | "standardDeviation";
export declare const calculatorTools: (config?: {
    excludeTools?: CalculatorTools[];
}) => Partial<Record<CalculatorTools, Tool>>;
export {};
//# sourceMappingURL=math.d.ts.map