'use client';

import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { useApiKeysStore, useChatStore } from '@repo/common/store';
import { mergeAspectRatioHint } from '@repo/common/utils/aspect-ratio';
import { http } from '@repo/shared/lib/http-client';
import { generateThreadId } from '@repo/shared/lib/thread-id';
import { log } from '@repo/shared/logger';
import type { Attachment, ThreadItem } from '@repo/shared/types';
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

            // Find last thread item with image outputs for continuity
            let parentId: string | undefined = undefined;
            try {
                if (threadId) {
                    const items = await useChatStore.getState().getThreadItems(threadId);
                    const sorted = (items || []).sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                    );
                    const lastWithImages = [...sorted]
                        .reverse()
                        .find((it) => Array.isArray(it.imageOutputs) && it.imageOutputs.length > 0);
                    if (lastWithImages) parentId = lastWithImages.id;
                }
            } catch {}

            // Create optimistic thread item with user prompt
            const newItem: ThreadItem = {
                id: threadItemId,
                threadId: threadId!,
                parentId,
                createdAt: now,
                updatedAt: now,
                status: 'PENDING',
                query: prompt,
                mode: useChatStore.getState().chatMode,
                isImageGeneration: true, // Flag to indicate this is an image generation request
            } as ThreadItem;

            await createThreadItem(newItem);

            // Trigger generation
            setIsGenerating(true);

            const apiKeys = getAllKeys();
            const images: Array<
                { base64?: string; url?: string; mediaType?: string; name?: string; }
            > = [];
            const seen = new Set<string>();
            const pushUnique = (
                img: { base64?: string; url?: string; mediaType?: string; name?: string; },
            ) => {
                const key = img.base64 ? `b64:${img.base64}` : `url:${img.url}`;
                if (key && !seen.has(key)) {
                    seen.add(key);
                    images.push(img);
                }
            };
            if (imageBase64) pushUnique({ base64: imageBase64, mediaType: 'image/png' });
            if (attachments?.length) {
                for (const a of attachments) {
                    if (a.url?.startsWith('data:')) {
                        const match = a.url.match(/^data:(.+);base64,(.*)$/);
                        if (match) {
                            pushUnique({
                                base64: match[2] || '',
                                mediaType: match[1] || a.contentType,
                                name: a.name,
                            });
                            continue;
                        }
                    }
                    pushUnique({ url: a.url, mediaType: a.contentType, name: a.name });
                }
            }

            // If no explicit images attached, try to use the last generated image for edit continuity
            if (images.length === 0 && threadId) {
                try {
                    const items = await useChatStore.getState().getThreadItems(threadId);
                    const sorted = (items || []).sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                    );
                    const lastWithImages = [...sorted]
                        .reverse()
                        .find((it) => Array.isArray(it.imageOutputs) && it.imageOutputs.length > 0);
                    const img = lastWithImages?.imageOutputs?.[0];
                    if (img) {
                        if (img.url) {
                            images.push({ url: img.url, mediaType: img.mediaType, name: img.name });
                        } else if (img.dataUrl) {
                            // dataUrl format: data:<mime>;base64,<data>
                            const match = String(img.dataUrl).match(/^data:(.+);base64,(.*)$/);
                            if (match) {
                                images.push({
                                    base64: match[2] || '',
                                    mediaType: match[1] || 'image/png',
                                });
                            }
                        }
                    }
                } catch {}
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
                            if (!editor) return;
                            editor.commands.insertContent(m.text);
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
