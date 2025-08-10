var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { tool } from "ai";
import { z } from "zod";
export var calculatorTools = function (config) {
    var _a;
    var tools = {
        add: tool({
            description: "Add two numbers and return the result",
            parameters: z.object({
                a: z.number().describe("First number"),
                b: z.number().describe("Second number"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, add(a, b)];
                });
            }); },
        }),
        subtract: tool({
            description: "Subtract second number from first and return the result",
            parameters: z.object({
                a: z.number().describe("First number"),
                b: z.number().describe("Second number"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, subtract(a, b)];
                });
            }); },
        }),
        multiply: tool({
            description: "Multiply two numbers and return the result",
            parameters: z.object({
                a: z.number().describe("First number"),
                b: z.number().describe("Second number"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, multiply(a, b)];
                });
            }); },
        }),
        divide: tool({
            description: "Divide first number by second and return the result",
            parameters: z.object({
                a: z.number().describe("Numerator"),
                b: z.number().describe("Denominator"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, divide(a, b)];
                });
            }); },
        }),
        exponentiate: tool({
            description: "Raise first number to the power of the second number",
            parameters: z.object({
                a: z.number().describe("Base"),
                b: z.number().describe("Exponent"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, exponentiate(a, b)];
                });
            }); },
        }),
        factorial: tool({
            description: "Calculate the factorial of a number",
            parameters: z.object({
                n: z.number().int().describe("Number to calculate the factorial of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, factorial(n)];
                });
            }); },
        }),
        isPrime: tool({
            description: "Check if a number is prime",
            parameters: z.object({
                n: z.number().int().describe("Number to check if prime"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, isPrime(n)];
                });
            }); },
        }),
        squareRoot: tool({
            description: "Calculate the square root of a number",
            parameters: z.object({
                n: z.number().describe("Number to calculate the square root of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, squareRoot(n)];
                });
            }); },
        }),
        sin: tool({
            description: "Calculate the sine of an angle in radians",
            parameters: z.object({
                n: z.number().describe("Angle in radians"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, sin(n)];
                });
            }); },
        }),
        cos: tool({
            description: "Calculate the cosine of an angle in radians",
            parameters: z.object({
                n: z.number().describe("Angle in radians"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, cos(n)];
                });
            }); },
        }),
        tan: tool({
            description: "Calculate the tangent of an angle in radians",
            parameters: z.object({
                n: z.number().describe("Angle in radians"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, tan(n)];
                });
            }); },
        }),
        sqrt: tool({
            description: "Calculate the square root of a number (alias for squareRoot)",
            parameters: z.object({
                n: z.number().describe("Number to calculate the square root of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, squareRoot(n)];
                });
            }); },
        }),
        log: tool({
            description: "Calculate the natural logarithm (base e) of a number",
            parameters: z.object({
                n: z.number().describe("Number to calculate the logarithm of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, log(n)];
                });
            }); },
        }),
        exp: tool({
            description: "Calculate e raised to the power of a number",
            parameters: z.object({
                n: z.number().describe("Power to raise e to"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, exp(n)];
                });
            }); },
        }),
        evaluateExpression: tool({
            description: "Evaluate a complete mathematical expression with proper order of operations (PEMDAS). Supports +, -, *, /, ^, (), sqrt(), sin(), cos(), tan(), log(), exp(), abs(), floor(), ceil(), round(), pi, e",
            parameters: z.object({
                expression: z
                    .string()
                    .describe('Mathematical expression to evaluate (e.g., "2 + 3 * 4", "sqrt(16) + sin(pi/2)", "(5 + 3) * 2^3")'),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var expression = _b.expression;
                return __generator(this, function (_c) {
                    return [2 /*return*/, evaluateExpression(expression)];
                });
            }); },
        }),
        abs: tool({
            description: "Calculate the absolute value of a number",
            parameters: z.object({
                n: z.number().describe("Number to get absolute value of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, absoluteValue(n)];
                });
            }); },
        }),
        floor: tool({
            description: "Round a number down to the nearest integer",
            parameters: z.object({
                n: z.number().describe("Number to floor"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, floor(n)];
                });
            }); },
        }),
        ceil: tool({
            description: "Round a number up to the nearest integer",
            parameters: z.object({
                n: z.number().describe("Number to ceil"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, ceil(n)];
                });
            }); },
        }),
        round: tool({
            description: "Round a number to the nearest integer",
            parameters: z.object({
                n: z.number().describe("Number to round"),
                decimals: z
                    .number()
                    .int()
                    .optional()
                    .describe("Number of decimal places (default: 0)"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n, _c = _b.decimals, decimals = _c === void 0 ? 0 : _c;
                return __generator(this, function (_d) {
                    return [2 /*return*/, roundNumber(n, decimals)];
                });
            }); },
        }),
        min: tool({
            description: "Find the minimum value from a list of numbers",
            parameters: z.object({
                numbers: z.array(z.number()).describe("Array of numbers to find minimum from"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var numbers = _b.numbers;
                return __generator(this, function (_c) {
                    return [2 /*return*/, minimum(numbers)];
                });
            }); },
        }),
        max: tool({
            description: "Find the maximum value from a list of numbers",
            parameters: z.object({
                numbers: z.array(z.number()).describe("Array of numbers to find maximum from"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var numbers = _b.numbers;
                return __generator(this, function (_c) {
                    return [2 /*return*/, maximum(numbers)];
                });
            }); },
        }),
        getConstants: tool({
            description: "Get mathematical constants (pi, e, golden ratio, etc.)",
            parameters: z.object({
                constant: z
                    .enum(["pi", "e", "goldenRatio", "euler", "sqrt2"])
                    .describe("Which constant to get"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var constant = _b.constant;
                return __generator(this, function (_c) {
                    return [2 /*return*/, getConstants(constant)];
                });
            }); },
        }),
        asin: tool({
            description: "Calculate the arcsine (inverse sine) of a number in radians",
            parameters: z.object({
                n: z.number().describe("Number between -1 and 1"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, arcsine(n)];
                });
            }); },
        }),
        acos: tool({
            description: "Calculate the arccosine (inverse cosine) of a number in radians",
            parameters: z.object({
                n: z.number().describe("Number between -1 and 1"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, arccosine(n)];
                });
            }); },
        }),
        atan: tool({
            description: "Calculate the arctangent (inverse tangent) of a number in radians",
            parameters: z.object({
                n: z.number().describe("Number to calculate arctangent of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, arctangent(n)];
                });
            }); },
        }),
        sinh: tool({
            description: "Calculate the hyperbolic sine of a number",
            parameters: z.object({
                n: z.number().describe("Number to calculate hyperbolic sine of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, hyperbolicSine(n)];
                });
            }); },
        }),
        cosh: tool({
            description: "Calculate the hyperbolic cosine of a number",
            parameters: z.object({
                n: z.number().describe("Number to calculate hyperbolic cosine of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, hyperbolicCosine(n)];
                });
            }); },
        }),
        tanh: tool({
            description: "Calculate the hyperbolic tangent of a number",
            parameters: z.object({
                n: z.number().describe("Number to calculate hyperbolic tangent of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n;
                return __generator(this, function (_c) {
                    return [2 /*return*/, hyperbolicTangent(n)];
                });
            }); },
        }),
        gcd: tool({
            description: "Calculate the Greatest Common Divisor (GCD) of two integers",
            parameters: z.object({
                a: z.number().int().describe("First integer"),
                b: z.number().int().describe("Second integer"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, greatestCommonDivisor(a, b)];
                });
            }); },
        }),
        lcm: tool({
            description: "Calculate the Least Common Multiple (LCM) of two integers",
            parameters: z.object({
                a: z.number().int().describe("First integer"),
                b: z.number().int().describe("Second integer"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var a = _b.a, b = _b.b;
                return __generator(this, function (_c) {
                    return [2 /*return*/, leastCommonMultiple(a, b)];
                });
            }); },
        }),
        permutation: tool({
            description: "Calculate permutations (nPr): number of ways to arrange r items from n items",
            parameters: z.object({
                n: z.number().int().describe("Total number of items"),
                r: z.number().int().describe("Number of items to arrange"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n, r = _b.r;
                return __generator(this, function (_c) {
                    return [2 /*return*/, permutation(n, r)];
                });
            }); },
        }),
        combination: tool({
            description: "Calculate combinations (nCr): number of ways to choose r items from n items",
            parameters: z.object({
                n: z.number().int().describe("Total number of items"),
                r: z.number().int().describe("Number of items to choose"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var n = _b.n, r = _b.r;
                return __generator(this, function (_c) {
                    return [2 /*return*/, combination(n, r)];
                });
            }); },
        }),
        mean: tool({
            description: "Calculate the arithmetic mean (average) of a list of numbers",
            parameters: z.object({
                numbers: z.array(z.number()).describe("Array of numbers to calculate mean of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var numbers = _b.numbers;
                return __generator(this, function (_c) {
                    return [2 /*return*/, arithmeticMean(numbers)];
                });
            }); },
        }),
        median: tool({
            description: "Calculate the median (middle value) of a list of numbers",
            parameters: z.object({
                numbers: z.array(z.number()).describe("Array of numbers to find median of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var numbers = _b.numbers;
                return __generator(this, function (_c) {
                    return [2 /*return*/, medianValue(numbers)];
                });
            }); },
        }),
        standardDeviation: tool({
            description: "Calculate the standard deviation of a list of numbers",
            parameters: z.object({
                numbers: z
                    .array(z.number())
                    .describe("Array of numbers to calculate standard deviation of"),
            }),
            execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var numbers = _b.numbers;
                return __generator(this, function (_c) {
                    return [2 /*return*/, standardDeviation(numbers)];
                });
            }); },
        }),
    };
    for (var toolName in tools) {
        if ((_a = config === null || config === void 0 ? void 0 : config.excludeTools) === null || _a === void 0 ? void 0 : _a.includes(toolName)) {
            delete tools[toolName];
        }
    }
    return tools;
};
function add(a, b) {
    return { result: a + b };
}
function subtract(a, b) {
    return { result: a - b };
}
function multiply(a, b) {
    return { result: a * b };
}
function divide(a, b) {
    if (b === 0) {
        return { error: "Cannot divide by zero" };
    }
    try {
        return { result: a / b };
    }
    catch (error) {
        return { error: error };
    }
}
function exponentiate(a, b) {
    return { result: Math.pow(a, b) };
}
function factorial(n) {
    if (n < 0) {
        return { error: "Factorial is not defined for negative numbers" };
    }
    var result = 1;
    for (var i = 2; i <= n; i++) {
        result *= i;
    }
    return { result: result };
}
function isPrime(n) {
    if (n <= 1) {
        return { result: false };
    }
    for (var i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            return { result: false };
        }
    }
    return { result: true };
}
function squareRoot(n) {
    if (n < 0) {
        return { error: "Square Root is not defined for negative numbers" };
    }
    return { result: Math.sqrt(n) };
}
function sin(n) {
    return { result: Math.sin(n) };
}
function cos(n) {
    return { result: Math.cos(n) };
}
function tan(n) {
    return { result: Math.tan(n) };
}
function log(n) {
    if (n <= 0) {
        return { error: "Logarithm is not defined for non-positive numbers" };
    }
    return { result: Math.log(n) };
}
function exp(n) {
    return { result: Math.exp(n) };
}
// Expression evaluator function
function evaluateExpression(expression) {
    try {
        // Replace mathematical constants
        var expr = expression
            .replace(/\bpi\b/g, Math.PI.toString())
            .replace(/\be\b/g, Math.E.toString())
            .replace(/\^/g, "**"); // Replace ^ with ** for exponentiation
        // Replace math functions with JavaScript Math equivalents
        expr = expr
            .replace(/sqrt\(/g, "Math.sqrt(")
            .replace(/sin\(/g, "Math.sin(")
            .replace(/cos\(/g, "Math.cos(")
            .replace(/tan\(/g, "Math.tan(")
            .replace(/log\(/g, "Math.log(")
            .replace(/exp\(/g, "Math.exp(")
            .replace(/abs\(/g, "Math.abs(")
            .replace(/floor\(/g, "Math.floor(")
            .replace(/ceil\(/g, "Math.ceil(")
            .replace(/round\(/g, "Math.round(");
        // Validate expression contains only allowed characters
        var allowedPattern = /^[0-9+\-*/().^ \tMath.sincoatlgexpabflorceiu]*$/;
        if (!allowedPattern.test(expr)) {
            return { error: "Expression contains invalid characters" };
        }
        // Evaluate the expression safely
        var result = Function("\"use strict\"; return (".concat(expr, ")"))();
        if (typeof result !== "number" || !Number.isFinite(result)) {
            return { error: "Expression did not evaluate to a valid number" };
        }
        return {
            result: result,
            originalExpression: expression,
            evaluatedExpression: expr,
        };
    }
    catch (error) {
        return {
            error: "Invalid mathematical expression: ".concat(error instanceof Error ? error.message : "Unknown error"),
            originalExpression: expression,
        };
    }
}
// Basic utility functions
function absoluteValue(n) {
    return { result: Math.abs(n) };
}
function floor(n) {
    return { result: Math.floor(n) };
}
function ceil(n) {
    return { result: Math.ceil(n) };
}
function roundNumber(n, decimals) {
    if (decimals === void 0) { decimals = 0; }
    var factor = Math.pow(10, decimals);
    return { result: Math.round(n * factor) / factor };
}
function minimum(numbers) {
    if (numbers.length === 0) {
        return { error: "Cannot find minimum of empty array" };
    }
    return { result: Math.min.apply(Math, numbers) };
}
function maximum(numbers) {
    if (numbers.length === 0) {
        return { error: "Cannot find maximum of empty array" };
    }
    return { result: Math.max.apply(Math, numbers) };
}
// Mathematical constants
function getConstants(constant) {
    var constants = {
        pi: Math.PI,
        e: Math.E,
        goldenRatio: (1 + Math.sqrt(5)) / 2, // φ
        euler: 0.5772156649015329, // Euler-Mascheroni constant γ
        sqrt2: Math.sqrt(2),
    };
    return {
        result: constants[constant],
        name: constant,
        description: getConstantDescription(constant),
    };
}
function getConstantDescription(constant) {
    var descriptions = {
        pi: "The ratio of a circle's circumference to its diameter (π ≈ 3.14159)",
        e: "Euler's number, base of natural logarithm (e ≈ 2.71828)",
        goldenRatio: "Golden ratio, often denoted φ (phi) ≈ 1.618",
        euler: "Euler-Mascheroni constant γ ≈ 0.5772",
        sqrt2: "Square root of 2 ≈ 1.414",
    };
    return descriptions[constant] || "Mathematical constant";
}
// Advanced trigonometric functions
function arcsine(n) {
    if (n < -1 || n > 1) {
        return { error: "Arcsine is only defined for values between -1 and 1" };
    }
    return { result: Math.asin(n) };
}
function arccosine(n) {
    if (n < -1 || n > 1) {
        return { error: "Arccosine is only defined for values between -1 and 1" };
    }
    return { result: Math.acos(n) };
}
function arctangent(n) {
    return { result: Math.atan(n) };
}
// Hyperbolic functions
function hyperbolicSine(n) {
    return { result: Math.sinh(n) };
}
function hyperbolicCosine(n) {
    return { result: Math.cosh(n) };
}
function hyperbolicTangent(n) {
    return { result: Math.tanh(n) };
}
// Number theory functions
function greatestCommonDivisor(a, b) {
    a = Math.abs(Math.floor(a));
    b = Math.abs(Math.floor(b));
    while (b !== 0) {
        var temp = b;
        b = a % b;
        a = temp;
    }
    return { result: a };
}
function leastCommonMultiple(a, b) {
    if (a === 0 || b === 0) {
        return { result: 0 };
    }
    var gcdResult = greatestCommonDivisor(a, b);
    if ("error" in gcdResult) {
        return gcdResult;
    }
    return { result: Math.abs(a * b) / gcdResult.result };
}
// Combinatorics functions
function permutation(n, r) {
    if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        return { error: "n and r must be non-negative integers" };
    }
    if (r > n) {
        return { result: 0 };
    }
    var result = 1;
    for (var i = n; i > n - r; i--) {
        result *= i;
    }
    return { result: result };
}
function combination(n, r) {
    if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        return { error: "n and r must be non-negative integers" };
    }
    if (r > n) {
        return { result: 0 };
    }
    if (r === 0 || r === n) {
        return { result: 1 };
    }
    // Use the smaller of r and n-r for efficiency
    r = Math.min(r, n - r);
    var result = 1;
    for (var i = 0; i < r; i++) {
        result = (result * (n - i)) / (i + 1);
    }
    return { result: Math.round(result) };
}
// Statistical functions
function arithmeticMean(numbers) {
    if (numbers.length === 0) {
        return { error: "Cannot calculate mean of empty array" };
    }
    var sum = numbers.reduce(function (acc, num) { return acc + num; }, 0);
    return { result: sum / numbers.length };
}
function medianValue(numbers) {
    if (numbers.length === 0) {
        return { error: "Cannot find median of empty array" };
    }
    var sorted = __spreadArray([], numbers, true).sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return { result: (sorted[mid - 1] + sorted[mid]) / 2 };
    }
    return { result: sorted[mid] };
}
function standardDeviation(numbers) {
    if (numbers.length === 0) {
        return { error: "Cannot calculate standard deviation of empty array" };
    }
    if (numbers.length === 1) {
        return { result: 0 };
    }
    var meanResult = arithmeticMean(numbers);
    if ("error" in meanResult) {
        return meanResult;
    }
    var mean = meanResult.result;
    var squaredDiffs = numbers.map(function (num) { return Math.pow((num - mean), 2); });
    var variance = squaredDiffs.reduce(function (acc, diff) { return acc + diff; }, 0) / (numbers.length - 1);
    return { result: Math.sqrt(variance) };
}
