import { fontFamily } from "tailwindcss/defaultTheme";

const config: any = {
    darkMode: ["class"],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                soft: "hsl(var(--soft))",
                hard: "hsl(var(--hard))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                brand: {
                    DEFAULT: "hsl(var(--brand))",
                    foreground: "hsl(var(--brand-foreground))",
                },
                tertiary: {
                    DEFAULT: "hsl(var(--tertiary))",
                    foreground: "hsl(var(--tertiary-foreground))",
                },
                quaternary: {
                    DEFAULT: "hsl(var(--quaternary))",
                    foreground: "hsl(var(--quaternary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderWidth: {
                DEFAULT: "0.8px",
            },
            borderRadius: {
                xs: "0.25rem",
                sm: "0.375rem",
                md: "0.5rem",
                lg: "0.625rem",
                xl: "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            fontFamily: {
                mono: ["var(--font-geist-mono)", ...fontFamily.mono],
                clash: ["var(--font-clash)", ...fontFamily.sans],
                sans: [
                    "SF Pro",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica Neue",
                    "Arial",
                    "sans-serif",
                ],
                bricolage: ["var(--font-bricolage)", ...fontFamily.sans],
            },
            fontSize: {
                xs: ["0.75rem", { lineHeight: "1.2rem", letterSpacing: "0.01em" }],
                sm: ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "0.008em" }],
                base: ["1rem", { lineHeight: "1.5rem" }],
                lg: ["1.125rem", { lineHeight: "1.75rem" }],
                xl: ["1.25rem", { lineHeight: "1.95rem" }],
                "2xl": ["1.5rem", { lineHeight: "2.25rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.5rem" }],
                "4xl": ["2.25rem", { lineHeight: "2.75rem" }],
                "5xl": ["3rem", { lineHeight: "3.5rem" }],
                "6xl": ["3.75rem", { lineHeight: "4rem" }],
                "7xl": ["4.5rem", { lineHeight: "4.5rem" }],
            },
            fontWeight: {
                normal: "400",
                medium: "500",
                semibold: "600",
                bold: "700",
                extrabold: "800",
                black: "900",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                marquee: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
                marquee2: {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(0%)" },
                },
                "fade-in-once": {
                    "0%": { opacity: 0, transform: "translateY(5px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
                "reveal-pop": {
                    "0%": { opacity: 0, transform: "scale(0.96) translateY(10px)" },
                    "70%": { opacity: 1, transform: "scale(1.01) translateY(-2px)" },
                    "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "glow-pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                },
                "scale-in": {
                    "0%": { transform: "scale(0.9)", opacity: 0 },
                    "100%": { transform: "scale(1)", opacity: 1 },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: 0 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in-once": "fade-in-once 10s ease-out forwards",
                "reveal-pop": "reveal-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                shimmer: "shimmer 1.5s ease-in-out infinite",
                "glow-pulse": "glow-pulse 2s ease-in-out infinite",
                "scale-in": "scale-in 0.2s ease-out",
                "slide-up": "slide-up 0.3s ease-out",
            },
            typography: () => ({
                prosetheme: {
                    css: {
                        "--tw-prose-body": "hsl(var(--foreground))",
                        "--tw-prose-headings": "hsl(var(--foreground))",
                        "--tw-prose-lead": "hsl(var(--muted-foreground))",
                        "--tw-prose-links": "hsl(var(--brand))",
                        "--tw-prose-bold": "hsl(var(--foreground))",
                        "--tw-prose-counters": "hsl(var(--muted-foreground)/0.1)",
                        "--tw-prose-bullets": "hsl(var(--muted-foreground)/0.1)",
                        "--tw-prose-hr": "hsl(var(--border))",
                        "--tw-prose-quotes": "hsl(var(--foreground))",
                        "--tw-prose-quote-borders": "hsl(var(--border))",
                        "--tw-prose-captions": "hsl(var(--muted-foreground))",
                        "--tw-prose-code": "hsl(var(--foreground))",
                        "--tw-prose-pre-code": "hsl(var(--muted-foreground))",
                        "--tw-prose-pre-bg": "hsl(var(--muted))",
                        "--tw-prose-th-borders": "hsl(var(--border))",
                        "--tw-prose-td-borders": "hsl(var(--border))",

                        // Dark mode values
                        "--tw-prose-invert-body": "hsl(var(--foreground))",
                        "--tw-prose-invert-headings": "hsl(var(--foreground))",
                        "--tw-prose-invert-lead": "hsl(var(--muted-foreground))",
                        "--tw-prose-invert-links": "hsl(var(--brand))",
                        "--tw-prose-invert-bold": "hsl(var(--foreground))",
                        "--tw-prose-invert-counters": "hsl(var(--muted-foreground))",
                        "--tw-prose-invert-bullets": "hsl(var(--muted-foreground))",
                        "--tw-prose-invert-hr": "hsl(var(--border))",
                        "--tw-prose-invert-quotes": "hsl(var(--foreground))",
                        "--tw-prose-invert-quote-borders": "hsl(var(--border))",
                        "--tw-prose-invert-captions": "hsl(var(--muted-foreground))",
                        "--tw-prose-invert-code": "hsl(var(--foreground))",
                        "--tw-prose-invert-pre-code": "hsl(var(--muted-foreground))",
                        "--tw-prose-invert-pre-bg": "hsl(var(--muted))",
                        "--tw-prose-invert-th-borders": "hsl(var(--border))",
                        "--tw-prose-invert-td-borders": "hsl(var(--border))",
                    },
                },
            }),
            boxShadow: {
                "subtle-xs": "var(--shadow-subtle-xs)",
                "subtle-sm": "var(--shadow-subtle-sm)",
                "glow-sm": "0 0 10px rgba(59, 130, 246, 0.3)",
                "glow-md": "0 0 20px rgba(59, 130, 246, 0.4)",
                "glow-lg": "0 0 30px rgba(59, 130, 246, 0.5)",
                premium: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                "premium-lg": "0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)",
            },
            spacing: {
                "18": "4.5rem",
                "22": "5.5rem",
                "26": "6.5rem",
                "30": "7.5rem",
                "34": "8.5rem",
                "38": "9.5rem",
            },
        },
    },

    plugins: [
        require("@tailwindcss/typography"),
        require("tailwindcss-animate"),
        require("tailwind-scrollbar-hide"),
        require("../ui/tailwind-scrollbar-plugin"),
    ],
};

export default config;
