import { MessageSquare } from 'lucide-react';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
                            <MessageSquare className="size-4" />
                        </div>
                        VTChat
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden lg:block">
                <img
                    src="/bg/bg_vt.avif"
                    alt="VTChat Background"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    );
}
