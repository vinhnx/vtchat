"use client";

import { Footer, WrapperDisclosure } from "@repo/common/components";
import { useSession } from "@repo/shared/lib/auth-client";
import { TypographyH1 } from "@repo/ui";
import Image from "next/image";
import Link from "next/link";
import goodfirmsBadge from "packages/ui/src/assets/goodfirms_badge.svg";
import peerlistBadge from "../../../public/icons/peerlist_badge.svg";

export function AboutPageClient() {
    const { data: _session, isPending } = useSession();

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="flex items-center justify-between border-b p-3 md:p-4">
                <TypographyH1 className="text-lg font-semibold md:text-xl">VT</TypographyH1>
            </header>
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-2xl space-y-6 text-center">
                    <TypographyH1 className="text-4xl font-bold">VT</TypographyH1>
                    <p className="break-words px-4 text-base text-gray-600 sm:text-lg dark:text-gray-400">
                        Welcome to VT - Your privacy-focused AI chat platform.
                    </p>
                    <WrapperDisclosure className="mt-4" />
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
                        <Link
                            href="https://peerlist.io/vinhnx/project/vt"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src={peerlistBadge}
                                alt="Peerlist badge"
                                width={150}
                                height={50}
                                unoptimized
                            />
                        </Link>
                        <Link
                            href="https://www.goodfirms.co/chatbot-software/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src={goodfirmsBadge}
                                alt="GoodFirms badge"
                                width={150}
                                height={50}
                                unoptimized
                            />
                        </Link>
                    </div>
                </div>
            </div>
            {!isPending && <Footer />}
        </div>
    );
}
