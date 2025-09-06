'use client';

import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { useApiKeysStore, useChatStore } from '@repo/common/store';
import { http } from '@repo/shared/lib/http-client';
import { generateThreadId } from '@repo/shared/lib/thread-id';
import { log } from '@repo/shared/logger';
import type { Attachment } from '@repo/shared/types';
import type { ThreadItem } from '@repo/shared/types';
import {
    Button,
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Tooltip,
    useToast,
} from '@repo/ui';
import { Image } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { mergeAspectRatioHint } from '@repo/common/utils/aspect-ratio';

export const ImageGenButton = ({
    attachments = [],
    imageBase64,
    onAfterGenerate,
}: { attachments?: Attachment[]; imageBase64?: string; onAfterGenerate?: () => void; }) => {
    const router = useRouter();
    const { threadId: currentThreadId } = useParams();
    const { toast } = useToast();
    const isVtPlus = useVtPlusAccess();

    const editor = useChatStore((s) => s.editor);
    const createThread = useChatStore((s) => s.createThread);
    const createThreadItem = useChatStore((s) => s.createThreadItem);
    const updateThreadItem = useChatStore((s) => s.updateThreadItem);
    const setIsGenerating = useChatStore((s) => s.setIsGenerating);
    const clearImageAttachment = useChatStore((s) => s.clearImageAttachment);

    const getAllKeys = useApiKeysStore((s) => s.getAllKeys);
    const hasGeminiKey = !!useApiKeysStore((s) => s.keys.GEMINI_API_KEY);

    const handleGenerate = useCallback(async () => {
        try {
            const prompt = editor?.getText()?.trim() || '';
            if (!prompt) {
                toast({
                    title: 'Enter a prompt',
                    description: 'Type a description to generate an image.',
                });
                return;
            }

            let threadId = currentThreadId?.toString();
            const threadItemId = await generateThreadId();
            const now = new Date();

            if (!threadId) {
                const optimisticThreadId = await generateThreadId();
                await createThread(optimisticThreadId, { title: prompt.slice(0, 60) });
                threadId = optimisticThreadId;
                router.push(`/chat/${optimisticThreadId}`);
            }

            // Create optimistic thread item with user prompt
            const newItem: ThreadItem = {
                id: threadItemId,
                threadId: threadId!,
                parentId: undefined,
                createdAt: now,
                updatedAt: now,
                status: 'PENDING',
                query: prompt,
                mode: useChatStore.getState().chatMode,
            } as ThreadItem;

            await createThreadItem(newItem);

            // Trigger generation
            setIsGenerating(true);

            const apiKeys = getAllKeys();
            const images: Array<
                { base64?: string; url?: string; mediaType?: string; name?: string; }
            > = [];
            if (imageBase64) images.push({ base64: imageBase64, mediaType: 'image/png' });
            if (attachments?.length) {
                for (const a of attachments) {
                    images.push({ url: a.url, mediaType: a.contentType, name: a.name });
                }
            }

            const result = await http.post<{ text: string; images: any[]; }>(
                '/api/image',
                {
                    body: { prompt, images },
                    apiKeys,
                    timeout: 120000,
                },
            );

            // Update item with results
            await updateThreadItem(threadId!, {
                id: threadItemId,
                answer: { text: result.text || '' },
                imageOutputs: result.images || [],
                status: 'COMPLETED',
                persistToDB: true,
            });

            // Clear editor and attachments
            editor?.commands.clearContent();
            clearImageAttachment();
            if (onAfterGenerate) onAfterGenerate();
        } catch (error: any) {
            let friendly = error?.message || 'Please try again later.';
            // Try to parse structured JSON from server (ky HTTPError)
            if (error?.response && typeof error.response.json === 'function') {
                try {
                    const data = await error.response.json();
                    if (data?.message) friendly = data.message;
                } catch {}
            }
            log.error({ error: friendly }, 'Image generation failed');
            toast({
                title: 'Image generation failed',
                description: friendly,
                variant: 'destructive',
            });

            const threadId = currentThreadId?.toString() || useChatStore.getState().currentThreadId
                || '';
            const lastItem = useChatStore.getState().getCurrentThreadItem(threadId);
            if (threadId && lastItem) {
                await updateThreadItem(threadId, {
                    id: lastItem.id,
                    status: 'ERROR',
                    error: friendly,
                    persistToDB: true,
                });
            }
        } finally {
            setIsGenerating(false);
        }
    }, [
        editor,
        createThread,
        createThreadItem,
        updateThreadItem,
        setIsGenerating,
        getAllKeys,
        clearImageAttachment,
        currentThreadId,
        router,
        toast,
    ]);

    const tooltip = hasGeminiKey
        ? 'Generate image from prompt'
        : 'Tip: Add your Gemini API Key in Settings for image generation';

    // Premium glass effect similar to VT+ badge
    const premiumClasses = 'vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E]';

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <Tooltip content={tooltip}>
                    <Button
                        onClick={handleGenerate}
                        size='sm'
                        variant={hasGeminiKey || isVtPlus ? 'secondary' : 'ghost'}
                        className={hasGeminiKey || isVtPlus ? premiumClasses : ''}
                        aria-label='Generate image'
                    >
                        <Image size={16} strokeWidth={2} />
                        <span className='ml-1 hidden sm:inline'>Generate Image</span>
                    </Button>
                </Tooltip>
            </ContextMenuTrigger>
            <ContextMenuContent align='start'>
                <ContextMenuItem onSelect={() => router.push('/settings?tab=api-keys')}>
                    Open API Keys
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export const StyleModeSelector = () => {
    const editor = useChatStore((s) => s.editor);
    const modes = [
        {
            label: 'Photorealistic',
            text:
                'A photorealistic [shot type] of [subject], [expression], set in [environment]. Illuminated by [lighting] to create a [mood] atmosphere. Captured with a [camera/lens], emphasizing [key textures]. [16:9]',
        },
        {
            label: 'Sticker',
            text:
                'A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. [line style] lines, [shading style] shading. Background must be transparent.',
        },
        {
            label: 'Product',
            text:
                'A high-resolution, studio-lit product photograph of [product] on a [surface/background]. Lighting: [setup] to [purpose]. Camera angle: [angle] to showcase [feature]. Ultra-realistic, sharp focus on [detail]. [1:1]',
        },
        {
            label: 'Minimalist',
            text:
                'A minimalist composition featuring a single [subject] positioned at the [position] with a vast [color] negative space background. Soft, subtle lighting. [16:9]',
        },
        {
            label: 'Comic',
            text:
                'A single comic panel in [art style]. Foreground: [character] [action]. Background: [setting details]. Include a [dialogue/caption] box with the text "[Text]". Lighting creates a [mood] mood. [4:3]',
        },
        {
            label: 'Edits',
            text:
                'Using the provided image, change only the [specific element] to [new element/description]. Keep all other content exactly the same (style, lighting, composition).',
        },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size='sm'
                    variant='secondary'
                    className='vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E]'
                    aria-label='Style mode templates'
                >
                    Styles
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
                {modes.map((m) => (
                    <DropdownMenuItem
                        key={m.label}
                        onClick={() => {
                            const current = (editor?.getText() || '').toLowerCase();
                            const alreadyHasStyle =
                                /photorealistic|sticker|studio-lit|minimalist|comic/.test(
                                    current,
                                );
                            if (!editor) return;
                            if (!current || current.trim().length === 0) {
                                editor.commands.insertContent(m.text);
                            } else if (!alreadyHasStyle) {
                                editor.commands.insertContent(`\n\n[Style: ${m.label}]`);
                            }
                        }}
                    >
                        {m.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const AspectRatioSelector = () => {
    const editor = useChatStore((s) => s.editor);
    const ratios = ['16:9', '1:1', '4:3', '3:2', '21:9'];

    const insertRatio = (r: string) => {
        if (!editor) return;
        const original = editor.getText() || '';
        // Use centralized merge/replace logic
        const result = mergeAspectRatioHint(original, r);
        if (result.replaced) {
            editor.commands.setContent(result.text, true);
            return;
        }

        // Fallback: append a succinct hint to the current cursor
        editor.commands.insertContent(` in ${r} aspect ratio`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size='sm'
                    variant='secondary'
                    className='vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E]'
                    aria-label='Aspect ratio selector'
                >
                    AR
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
                {ratios.map((r) => (
                    <DropdownMenuItem key={r} onClick={() => insertRatio(r)}>
                        {r}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
