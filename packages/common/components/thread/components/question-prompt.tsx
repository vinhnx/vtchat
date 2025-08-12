'use client';

import { useAgentStream } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import type { ThreadItem } from '@repo/shared/types';
import { Button, RadioGroup, RadioGroupItem, Textarea } from '@repo/ui';
import { Check, HelpCircle, Square } from 'lucide-react';
import { useMemo, useState } from 'react';

export const QuestionPrompt = ({ threadItem }: { threadItem: ThreadItem; }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [customOption, setCustomOption] = useState<string>('');
    const [_isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
    const { handleSubmit } = useAgentStream();
    const getThreadItems = useChatStore((state) => state.getThreadItems);
    const updateThreadItem = useChatStore((state) => state.updateThreadItem);

    const options: string[] = threadItem.object?.clarifyingQuestion?.options || [];
    const question = threadItem.object?.clarifyingQuestion?.question || '';
    const choiceType = threadItem.object?.clarifyingQuestion?.choiceType || 'multiple';
    const isSubmitted = !!threadItem.object?.clarifyingQuestion?.submittedQuery;

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setIsCustomSelected(value === 'custom');
    };

    const hasClarifyingQuestions = useMemo(() => {
        return threadItem.object?.clarifyingQuestion;
    }, [threadItem.object]);

    const renderRadioGroup = () => {
        return (
            <RadioGroup
                className='flex flex-col gap-2'
                onValueChange={handleOptionChange}
                value={selectedOption || ''}
            >
                {options.map((option, index) => (
                    <div className='flex items-center space-x-2' key={index}>
                        <RadioGroupItem id={`option-${index}`} value={option} />
                        <p className='text-sm'>{option}</p>
                    </div>
                ))}

                <div className='flex items-center space-x-2'>
                    <RadioGroupItem id='option-custom' value='custom' />
                    <p className='text-sm'>Custom option</p>
                </div>
            </RadioGroup>
        );
    };

    const renderCheckboxGroup = () => {
        return (
            <div className='flex flex-row flex-wrap gap-2'>
                {options.map((option, index) => (
                    <div
                        className='border-border flex items-center space-x-2 rounded-full border px-3 py-1.5'
                        key={index}
                        onClick={() => {
                            if (selectedOptions.includes(option)) {
                                setSelectedOptions(selectedOptions.filter((o) => o !== option));
                            } else {
                                setSelectedOptions([...selectedOptions, option]);
                            }
                        }}
                    >
                        {selectedOptions.includes(option)
                            ? <Check className='text-brand' size={16} strokeWidth={2} />
                            : (
                                <Square
                                    className='text-muted-foreground/20'
                                    size={16}
                                    strokeWidth={2}
                                />
                            )}
                        <p className='text-sm'>{option}</p>
                    </div>
                ))}
            </div>
        );
    };

    if (isSubmitted) {
        return (
            <div className='border-border bg-background mt-2 flex w-full flex-col items-start gap-4 rounded-lg border p-4'>
                <span className='flex flex-row items-center gap-1 text-xs font-medium text-yellow-700'>
                    <Check size={14} strokeWidth={2} /> Submitted
                </span>
                <div className='flex flex-col'>
                    <p className='text-base'>
                        {threadItem.object?.clarifyingQuestion?.submittedQuery}
                    </p>
                </div>
            </div>
        );
    }

    if (!hasClarifyingQuestions) {
        return null;
    }

    return (
        <div className='border-border bg-background mt-2 flex w-full flex-col items-start gap-4 rounded-lg border p-4'>
            <div className='flex flex-row items-center gap-1'>
                <HelpCircle className='text-brand' size={16} strokeWidth={2} />
                <p className='text-sm text-yellow-700'>Follow-up Question</p>
            </div>

            <p className='text-base'>{question}</p>

            {choiceType === 'single' ? renderRadioGroup() : renderCheckboxGroup()}

            <div className='mt-2 w-full'>
                <Textarea
                    className='!border-border h-[100px] w-full rounded-lg !border px-3 py-2'
                    onChange={(e) => setCustomOption(e.target.value)}
                    placeholder='Add your response here...'
                    value={customOption}
                />
            </div>

            <Button
                disabled={!(selectedOption || selectedOptions.length || customOption)}
                onClick={async () => {
                    const originalQuery = threadItem.query || '';
                    let clarifyingResponse = '';

                    if (choiceType === 'single') {
                        clarifyingResponse = `${
                            selectedOption ? `${selectedOption} \n\n` : ''
                        }${customOption}`;
                    } else {
                        clarifyingResponse = `${
                            selectedOptions?.length ? `${selectedOptions.join(', ')} \n\n` : ''
                        }${customOption}`;
                    }

                    const query = originalQuery
                        ? `${originalQuery}\n\nAdditional context: ${clarifyingResponse}`
                        : clarifyingResponse;

                    const formData = new FormData();
                    formData.append('query', query);
                    const threadItems = await getThreadItems(threadItem.threadId);
                    updateThreadItem(threadItem.threadId, {
                        ...threadItem,
                        object: {
                            ...threadItem.object,
                            clarifyingQuestion: {
                                ...threadItem.object?.clarifyingQuestion,
                                submittedQuery: query,
                            },
                        },
                        status: 'COMPLETED',
                    });
                    setTimeout(() => {
                        handleSubmit({
                            formData,
                            messages: threadItems,
                        });
                    }, 1000);
                }}
                rounded='full'
                size='sm'
            >
                Submit
            </Button>
        </div>
    );
};
