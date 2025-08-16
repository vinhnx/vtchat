'use client';

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui';
import { HelpCircle } from 'lucide-react';

export default function DialogAnimationTest() {
    return (
        <div className='min-h-screen p-8 bg-background'>
            <h1 className='text-2xl font-bold mb-8'>Dialog Animation Test</h1>
            <div className='space-y-8'>
                {/* Test dialogs in different positions */}
                <div className='grid grid-cols-3 gap-4 h-32'>
                    {/* Top row */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Top Left Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Top Left Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the top-left trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Top Center Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Top Center Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the top-center trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Top Right Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Top Right Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the top-right trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className='grid grid-cols-3 gap-4 h-32'>
                    {/* Middle row */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Middle Left Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Middle Left Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the middle-left trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Center Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Center Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the center trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Middle Right Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Middle Right Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the middle-right trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className='grid grid-cols-3 gap-4 h-32'>
                    {/* Bottom row */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Bottom Left Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bottom Left Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the bottom-left trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Bottom Center Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bottom Center Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the bottom-center trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-full'>
                                Bottom Right Dialog
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bottom Right Position</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the bottom-right trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Special case: Small icon trigger */}
                <div className='mt-16'>
                    <h2 className='text-lg font-semibold mb-4'>Small Icon Trigger Test</h2>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='ghost' size='sm'>
                                <HelpCircle size={16} />
                                Help
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Small Icon Trigger</DialogTitle>
                                <DialogDescription>
                                    This dialog should animate from the small help icon trigger position.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}