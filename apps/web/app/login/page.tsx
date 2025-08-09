"use client";

import { ShineText } from "@repo/common/components";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
    const [animationProps, setAnimationProps] = useState({
        initial: { opacity: 0, x: 0, y: 0 },
        animate: { opacity: 1, x: 0, y: 0 },
        transition: { duration: 0 },
    });

    // Set animation properties client-side to avoid SSR issues
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobile = window.innerWidth < 768;

        if (!prefersReducedMotion) {
            setAnimationProps({
                initial: { opacity: 0, x: isMobile ? -10 : -20, y: isMobile ? -5 : -10 },
                animate: { opacity: 1, x: 0, y: 0 },
                transition: { duration: isMobile ? 0.3 : 0.4, ease: "easeOut" as const },
            });
        }
    }, []);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <h1
                style={{
                    position: "absolute",
                    left: "-10000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                }}
            >
                VT Login - Access Your Minimal AI Chat Account
            </h1>
            <motion.div
                className="flex transform-gpu flex-col gap-4 p-6 will-change-transform md:p-10"
                initial={animationProps.initial}
                animate={animationProps.animate}
                transition={animationProps.transition}
            >
                <motion.div
                    className="flex transform-gpu justify-center gap-2 will-change-transform md:justify-start"
                    initial={animationProps.initial}
                    animate={animationProps.animate}
                    transition={{ ...animationProps.transition, delay: 0.1 }}
                >
                    <Link className="flex items-center gap-2 font-medium" href="/">
                        <ShineText className="text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl md:text-4xl">
                            VT
                        </ShineText>
                    </Link>
                </motion.div>
                <motion.div
                    className="flex flex-1 transform-gpu items-center justify-center will-change-transform"
                    initial={animationProps.initial}
                    animate={animationProps.animate}
                    transition={{ ...animationProps.transition, delay: 0.2 }}
                >
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </motion.div>
            </motion.div>
            <motion.div
                className="relative hidden transform-gpu will-change-transform lg:block"
                initial={animationProps.initial}
                animate={animationProps.animate}
                transition={{ ...animationProps.transition, delay: 0.3 }}
            >
                <Image
                    alt="VT Background"
                    className="object-cover"
                    fill
                    priority
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    src="/bg/bg_vt.avif"
                />
            </motion.div>
        </div>
    );
}
