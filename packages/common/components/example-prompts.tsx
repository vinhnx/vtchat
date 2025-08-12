'use client';

import { useAppStore, useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { ButtonWithIcon } from '@repo/ui';
import type { Editor } from '@tiptap/react';
import { Calculator, HelpCircle, Lightbulb, Pencil, Search } from 'lucide-react';
import { useState } from 'react';
import { LoginRequiredDialog } from './login-required-dialog';

export const examplePrompts = {
    howTo: [
        'How to use AI tools to improve daily productivity?',
        'Search for the latest job market trends in 2025 and create a career roadmap',
        'How to start a successful newsletter in 2025?',
        'Find current social media engagement rates and calculate my content ROI',
        'How to navigate the complexities of personal data privacy online?',
        'How to build a personal brand online effectively?',
        'Search for top cybersecurity threats in 2025 and create a protection plan',
    ],

    explainConcepts: [
        'Explain how Large Language Models work.',
        'Search for the latest AI breakthroughs and explain their significance',
        'What is the metaverse and what are its potential real-world applications?',
        'Find current quantum computing developments and explain their impact',
        'Explain the role of decentralized autonomous organizations (DAOs).',
        'Search for edge computing use cases and create a comparison chart',
        'Explain Swift programming language',
    ],

    creative: [
        'Write a news headline from the year 2042.',
        'Search for current space exploration missions and write a sci-fi story',
        'Draft a pitch for a startup leveraging AI to solve a global challenge.',
        'Find climate change data and create a visualization of future scenarios',
        'Develop a concept for a documentary exploring the future of work.',
        'Search for renewable energy trends and design an innovative solution',
        'Create a chart comparing different AI model capabilities and costs',
    ],

    advice: [
        'What are key skills to develop for the future job market shaped by AI?',
        'Search for salary data in tech and calculate the best career path ROI',
        'What are some ethical guidelines for using generative AI in creative work?',
        'Find remote work statistics and create a productivity optimization plan',
        'Search for learning platform reviews and recommend the best options',
        'Calculate the compound growth of investing in different skill areas',
        'Find innovation metrics and chart successful team management strategies',
    ],

    analysis: [
        'Search for AI adoption rates by industry and create a comprehensive analysis',
        'Find current AI investment data and chart the market growth trends',
        'Search for scientific AI breakthroughs and analyze their research impact',
        'Find urban planning data and calculate the cost-benefit of remote work',
        'Search for creative industry AI usage and visualize the disruption patterns',
        'Find supply chain resilience data and create a risk assessment chart',
        'Calculate cybersecurity ROI for small businesses using current breach costs',
    ],
};

export const getRandomPrompt = (category?: keyof typeof examplePrompts) => {
    if (category && examplePrompts[category]) {
        const prompts = examplePrompts[category];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    // If no category specified or invalid category, return a random prompt from any category
    const categories = Object.keys(examplePrompts) as Array<keyof typeof examplePrompts>;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const prompts = examplePrompts[randomCategory];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

// Map of category to icon component
const categoryIcons = {
    howTo: { name: 'How to', icon: HelpCircle, color: '!text-muted-foreground' },
    explainConcepts: {
        name: 'Explain Concepts',
        icon: Lightbulb,
        color: '!text-muted-foreground',
    },
    creative: { name: 'Creative', icon: Pencil, color: '!text-muted-foreground' },
    advice: { name: 'Advice', icon: Calculator, color: '!text-muted-foreground' },
    analysis: { name: 'Analysis', icon: Search, color: '!text-muted-foreground' },
};

export const ExamplePrompts = () => {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const showExamplePrompts = useAppStore((state) => state.showExamplePrompts);
    const editor: Editor | undefined = useChatStore((state) => state.editor);

    const handleCategoryClick = (category: keyof typeof examplePrompts) => {
        log.info({ data: editor }, 'editor');
        if (!editor) return;

        // Check if user is signed in before allowing interaction
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

        const randomPrompt = getRandomPrompt(category);
        editor.commands.clearContent();
        editor.commands.insertContent(randomPrompt);

        // Auto-activate appropriate tools based on prompt content
        const setActiveButton = useChatStore.getState().setActiveButton;
        const promptLower = randomPrompt.toLowerCase();

        if (promptLower.includes('search') || promptLower.includes('find')) {
            // Enable web search for prompts containing search terms
            if (!useChatStore.getState().useWebSearch) {
                setActiveButton('webSearch');
            }
        } else if (
            promptLower.includes('calculate')
            || promptLower.includes('roi')
            || promptLower.includes('cost')
        ) {
            // Enable calculator for prompts containing math terms
            if (!useChatStore.getState().useMathCalculator) {
                setActiveButton('mathCalculator');
            }
        } else if (
            promptLower.includes('chart')
            || promptLower.includes('visuali')
            || promptLower.includes('comparison')
        ) {
            // Enable charts for prompts containing chart terms
            if (!useChatStore.getState().useCharts) {
                setActiveButton('charts');
            }
        }
    };

    // Don't show if user has disabled it in settings
    if (!showExamplePrompts) return null;

    if (!editor) return null;

    return (
        <>
            <div className='animate-fade-in mb-4 flex w-full flex-wrap justify-center gap-1 p-2 transition-all duration-1000 sm:mb-8 sm:gap-2 sm:p-6'>
                {Object.entries(categoryIcons).map(([category, value], index) => (
                    <ButtonWithIcon
                        className='hover:bg-accent/80 transition-all hover:opacity-90'
                        icon={<value.icon className={value.color} size={16} />}
                        key={index}
                        onClick={() => handleCategoryClick(category as keyof typeof examplePrompts)}
                        size='sm'
                        variant='outline'
                    >
                        {value.name}
                    </ButtonWithIcon>
                ))}
            </div>

            {/* Login prompt dialog */}
            {showLoginPrompt && (
                <LoginRequiredDialog
                    description='Please log in to use example prompts and start chatting.'
                    isOpen={showLoginPrompt}
                    onClose={() => setShowLoginPrompt(false)}
                    title='Login Required'
                />
            )}
        </>
    );
};
