'use client';

import { useAppStore, useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { ButtonWithIcon } from '@repo/ui';
import type { Editor } from '@tiptap/react';
import { BarChart, Book, HelpCircle, Lightbulb, Pencil } from 'lucide-react';
import { useState } from 'react';
import { LoginRequiredDialog } from './login-required-dialog';

export const examplePrompts = {
    howTo: [
        'How to use AI tools to improve daily productivity?',
        'How to start a successful newsletter in 2025?',
        'How to create engaging short-form video content for social media?',
        'How to navigate the complexities of personal data privacy online?',
        'How to build a personal brand online effectively?',
        'How to identify and avoid online phishing scams?',
        'How to create a compelling presentation for a diverse audience?',
    ],

    explainConcepts: [
        'Explain how Large Language Models work.',
        'Explain the concept of "prompt engineering" for AI models.',
        'What is the metaverse and what are its potential real-world applications?',
        'Explain the current state of quantum computing and its near-term impact.',
        'Explain the role of decentralized autonomous organizations (DAOs).',
        'Explain the concept of digital twins and their applications.',
        'What is edge computing and how does it relate to IoT?',
    ],

    creative: [
        'Write a news headline from the year 2042.',
        'Imagine a dialogue between an AI assistant and a philosopher about consciousness.',
        'Draft a pitch for a startup leveraging AI to solve a global challenge.',
        'Describe a day in the life of someone living in a fully smart city.',
        'Develop a concept for a documentary exploring the future of work.',
        'Write a short script for a podcast episode discussing future technologies.',
        'Design an innovative solution for reducing plastic waste using current tech.',
    ],

    advice: [
        'What are key skills to develop for the future job market shaped by AI?',
        'How can individuals combat misinformation in the digital age?',
        'What are some ethical guidelines for using generative AI in creative work?',
        'How to adapt to rapidly changing technologies in the workplace?',
        'What are effective strategies for lifelong learning in a fast-changing world?',
        'What are practical steps to improve critical thinking skills?',
        'How to foster innovation within a team or organization?',
    ],

    analysis: [
        'Analyze the societal impact of widespread AI adoption in various industries.',
        'Compare the potential benefits and risks of advanced AI systems.',
        'Examine the role of AI in accelerating scientific discovery.',
        'Analyze the future of remote work and its effect on urban planning.',
        'Evaluate the impact of generative AI on creative industries.',
        'Analyze the challenges and opportunities of global supply chain resilience.',
        'Evaluate the effectiveness of different cybersecurity measures for small businesses.',
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
    howTo: { name: 'How to', icon: HelpCircle, color: '!text-gray-600' },
    explainConcepts: {
        name: 'Explain Concepts',
        icon: Lightbulb,
        color: '!text-gray-600',
    },
    creative: { name: 'Creative', icon: Pencil, color: '!text-gray-600' },
    advice: { name: 'Advice', icon: Book, color: '!text-gray-600' },
    analysis: { name: 'Analysis', icon: BarChart, color: '!text-gray-600' },
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
    };

    // Don't show if user has disabled it in settings
    if (!showExamplePrompts) return null;

    if (!editor) return null;

    return (
        <>
            <div className="animate-fade-in mb-4 flex w-full flex-wrap justify-center gap-1 p-2 sm:mb-8 sm:gap-2 sm:p-6 transition-all duration-1000">
                {Object.entries(categoryIcons).map(([category, value], index) => (
                    <ButtonWithIcon
                        className="hover:bg-accent/80 transition-all hover:opacity-90"
                        icon={<value.icon className={value.color} size={16} />}
                        key={index}
                        onClick={() => handleCategoryClick(category as keyof typeof examplePrompts)}
                        size="sm"
                        variant="outline"
                    >
                        {value.name}
                    </ButtonWithIcon>
                ))}
            </div>

            {/* Login prompt dialog */}
            {showLoginPrompt && (
                <LoginRequiredDialog
                    description="Please log in to use example prompts and start chatting."
                    isOpen={showLoginPrompt}
                    onClose={() => setShowLoginPrompt(false)}
                    title="Login Required"
                />
            )}
        </>
    );
};
