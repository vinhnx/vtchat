import Image from 'next/image';

import { LoginForm } from '@/components/login-form';
import { ShineText } from '@repo/common/components';

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <ShineText className="text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl md:text-4xl">
                            VT
                        </ShineText>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden lg:block">
                <Image
                    src="/bg/bg_vt.avif"
                    alt="VT Background"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    quality={100}
                />
            </div>
        </div>
    );
}
