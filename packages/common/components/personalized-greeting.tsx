'use client';

import { ShineText } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import { Flex } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

type PersonalizedGreetingProps = {
    session?: any;
};

export const PersonalizedGreeting = ({ session: initialSession }: PersonalizedGreetingProps) => {
    const { data: session } = useSession({
        initialData: {
            session: initialSession,
            user: initialSession?.user,
        },
    });
    const [greeting, setGreeting] = React.useState<string>('');

    React.useEffect(() => {
        const getTimeBasedGreeting = () => {
            const hour = new Date().getHours();
            const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '';
            const userNamePart = userName ? `, ${userName}!` : '';

            if (hour >= 5 && hour < 12) {
                return `Good morning${userNamePart}`;
            }
            if (hour >= 12 && hour < 18) {
                return `Good afternoon${userNamePart}`;
            }
            return `Good evening${userNamePart}`;
        };

        setGreeting(getTimeBasedGreeting());

        // Update the greeting if the component is mounted during a time transition
        const interval = setInterval(() => {
            const newGreeting = getTimeBasedGreeting();
            setGreeting((prev) => (prev !== newGreeting ? newGreeting : prev));
        }, 60_000); // Check every minute

        return () => clearInterval(interval);
    }, [session]); // Removed greeting from dependency array

    return (
        <Flex
            className='relative h-[100px] min-h-[100px] w-full items-center justify-center overflow-hidden'
            direction='col'
        >
            <AnimatePresence mode='wait'>
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center'
                    exit={{ opacity: 0, y: 5 }}
                    initial={{ opacity: 0, y: -5 }}
                    key={greeting}
                    transition={{
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                >
                    <ShineText className='text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl md:text-4xl'>
                        {greeting}
                    </ShineText>
                </motion.div>
            </AnimatePresence>
        </Flex>
    );
};
