'use client';

import { useContextualFeedback } from '@repo/common/hooks';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ContextualButton,
    ContextualNotification,
    CopyButton,
    SaveButton,
    DownloadButton,
    ShareButton,
    BookmarkButton,
    FieldFeedback,
    Input,
    Label,
    Separator,
} from '@repo/ui';
import { useState } from 'react';

/**
 * Demo component showcasing contextual notifications as alternatives to toasts
 * This demonstrates clean, contextual user feedback that doesn't interrupt workflow
 */
export function ContextualFeedbackDemo() {
    const [formValue, setFormValue] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showInlineNotification, setShowInlineNotification] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    
    const { status, message, executeAction } = useContextualFeedback();

    const simulateAction = async (actionName: string, shouldFail = false) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        if (shouldFail) {
            throw new Error(`${actionName} failed - simulated error`);
        }
    };

    const validateEmail = async (email: string) => {
        setValidationStatus('validating');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate validation delay
        
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setValidationStatus(isValid ? 'valid' : 'invalid');
    };

    return (
        <div className='max-w-4xl mx-auto p-6 space-y-8'>
            <div className='text-center space-y-2'>
                <h1 className='text-3xl font-bold'>Contextual User Notifications</h1>
                <p className='text-muted-foreground'>
                    Clean, contextual feedback that keeps the UI minimal and respects user workflow
                </p>
            </div>

            {/* Contextual Buttons Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Contextual Action Buttons</CardTitle>
                    <CardDescription>
                        Buttons that provide immediate visual feedback without disrupting the user experience
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex flex-wrap gap-3'>
                        <CopyButton
                            text='This text will be copied to your clipboard!'
                            size='sm'
                        />
                        
                        <SaveButton
                            onSave={async () => {
                                await simulateAction('Save');
                            }}
                            size='sm'
                        />
                        
                        <DownloadButton
                            onDownload={async () => {
                                await simulateAction('Download');
                            }}
                            size='sm'
                        />
                        
                        <ShareButton
                            onShare={async () => {
                                await simulateAction('Share');
                            }}
                            size='sm'
                        />
                        
                        <BookmarkButton
                            isBookmarked={isBookmarked}
                            onBookmark={async () => {
                                await simulateAction('Bookmark');
                                setIsBookmarked(!isBookmarked);
                            }}
                            size='sm'
                        />
                    </div>
                    
                    <Separator />
                    
                    <div className='space-y-2'>
                        <h4 className='font-medium'>Custom Contextual Button</h4>
                        <div className='flex gap-3'>
                            <ContextualButton
                                action={async () => {
                                    await simulateAction('Custom Action');
                                }}
                                idleText='Try Me'
                                loadingText='Working...'
                                successText='Done!'
                                errorText='Oops!'
                                showTextOnSuccess={true}
                                variant='outline'
                                size='sm'
                            />
                            
                            <ContextualButton
                                action={async () => {
                                    await simulateAction('Failing Action', true);
                                }}
                                idleText='This Will Fail'
                                loadingText='Failing...'
                                errorText='Failed!'
                                showTextOnError={true}
                                variant='outline'
                                size='sm'
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Inline Notifications Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Inline Contextual Notifications</CardTitle>
                    <CardDescription>
                        Subtle notifications that appear near the action without creating overlays
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        <Button
                            onClick={() => {
                                setShowInlineNotification(true);
                                setTimeout(() => setShowInlineNotification(false), 3000);
                            }}
                            variant='outline'
                            size='sm'
                        >
                            Show Notification
                        </Button>
                        
                        <ContextualNotification
                            show={showInlineNotification}
                            variant='success'
                        >
                            Action completed successfully!
                        </ContextualNotification>
                    </div>
                </CardContent>
            </Card>

            {/* Form Field Feedback Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Form Field Contextual Feedback</CardTitle>
                    <CardDescription>
                        Real-time validation feedback that appears contextually near form fields
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='email-input'>Email Address</Label>
                        <Input
                            id='email-input'
                            type='email'
                            placeholder='Enter your email'
                            value={formValue}
                            onChange={(e) => {
                                setFormValue(e.target.value);
                                if (e.target.value) {
                                    validateEmail(e.target.value);
                                } else {
                                    setValidationStatus('idle');
                                }
                            }}
                        />
                        <FieldFeedback
                            status={validationStatus}
                            message={
                                validationStatus === 'validating' 
                                    ? 'Validating email...'
                                    : validationStatus === 'valid'
                                    ? 'Email looks good!'
                                    : validationStatus === 'invalid'
                                    ? 'Please enter a valid email address'
                                    : undefined
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action with Feedback Hook Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Action with Contextual Feedback Hook</CardTitle>
                    <CardDescription>
                        Using the useContextualFeedback hook for custom action handling
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        <Button
                            onClick={() => {
                                executeAction(
                                    () => simulateAction('Complex Action'),
                                    {
                                        loadingMessage: 'Processing your request...',
                                        successMessage: 'Request completed successfully!',
                                        errorMessage: 'Request failed. Please try again.',
                                    }
                                );
                            }}
                            variant='outline'
                            size='sm'
                            disabled={status === 'loading'}
                        >
                            Execute Action
                        </Button>
                        
                        {status !== 'idle' && (
                            <ContextualNotification
                                show={true}
                                variant={
                                    status === 'loading' 
                                        ? 'info' 
                                        : status === 'success' 
                                        ? 'success' 
                                        : 'error'
                                }
                            >
                                {message}
                            </ContextualNotification>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Benefits of Contextual Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className='space-y-2 text-sm text-muted-foreground'>
                        <li>• <strong>Clean UI:</strong> No intrusive popups or overlays that block content</li>
                        <li>• <strong>Contextual:</strong> Feedback appears exactly where the action occurred</li>
                        <li>• <strong>Non-disruptive:</strong> Users can continue their workflow uninterrupted</li>
                        <li>• <strong>Accessible:</strong> Screen readers can easily announce status changes</li>
                        <li>• <strong>Performance:</strong> Lightweight animations and minimal DOM changes</li>
                        <li>• <strong>Consistent:</strong> Unified feedback patterns across the application</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}