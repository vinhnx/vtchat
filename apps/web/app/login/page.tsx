"use client";

import { LoginForm } from "@/components/login-form";
import { ShineText } from "@repo/common/components";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
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
                className="flex flex-col gap-4 p-6 md:p-10 transform-gpu will-change-transform"
                initial={{
                    opacity: 0,
                    x: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? 0
                        : window.innerWidth < 768
                          ? -10
                          : -20,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                    duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? 0
                        : window.innerWidth < 768
                          ? 0.3
                          : 0.4,
                    ease: "easeOut",
                }}
            >
                <motion.div
                    className="flex justify-center gap-2 md:justify-start transform-gpu will-change-transform"
                    initial={{
                        opacity: 0,
                        y: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                            ? 0
                            : window.innerWidth < 768
                              ? -10
                              : -20,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                            ? 0
                            : window.innerWidth < 768
                              ? 0.3
                              : 0.4,
                        delay: window.innerWidth < 768 ? 0.05 : 0.1,
                        ease: "easeOut",
                    }}
                >
                    <Link className="flex items-center gap-2 font-medium" href="/">
                        <ShineText className="text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl md:text-4xl">
                            VT
                        </ShineText>
                    </Link>
                </motion.div>
                <motion.div
                    className="flex flex-1 items-center justify-center transform-gpu will-change-transform"
                    initial={{
                        opacity: 0,
                        y: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                            ? 0
                            : window.innerWidth < 768
                              ? 10
                              : 20,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                            ? 0
                            : window.innerWidth < 768
                              ? 0.3
                              : 0.4,
                        delay: window.innerWidth < 768 ? 0.1 : 0.2,
                        ease: "easeOut",
                    }}
                >
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </motion.div>
            </motion.div>
            <motion.div
                className="relative hidden lg:block transform-gpu will-change-transform"
                initial={{
                    opacity: 0,
                    x: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 20,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                    duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ? 0
                        : 0.4,
                    delay: 0.3,
                    ease: "easeOut",
                }}
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
