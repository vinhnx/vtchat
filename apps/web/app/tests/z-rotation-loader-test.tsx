'use client';

import { ZRotationLoader } from '@repo/common';

export default function ZRotationLoaderTest() {
    return (
        <div className='min-h-screen bg-background p-8 space-y-8'>
            <div className='max-w-2xl mx-auto space-y-8'>
                <h1 className='text-2xl font-bold text-center'>Z-Rotation Loader Test</h1>

                <div className='space-y-6'>
                    <div className='space-y-2'>
                        <h2 className='text-lg font-semibold'>Small Size</h2>
                        <div className='border rounded-lg p-4 flex justify-center'>
                            <ZRotationLoader size='sm' />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <h2 className='text-lg font-semibold'>Medium Size (Default)</h2>
                        <div className='border rounded-lg p-4 flex justify-center'>
                            <ZRotationLoader />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <h2 className='text-lg font-semibold'>Large Size</h2>
                        <div className='border rounded-lg p-4 flex justify-center'>
                            <ZRotationLoader size='lg' />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <h2 className='text-lg font-semibold'>Speed Variations</h2>
                        <div className='grid grid-cols-3 gap-4'>
                            <div className='border rounded-lg p-4 flex flex-col items-center gap-2'>
                                <p className='text-sm font-medium'>Slow</p>
                                <ZRotationLoader speed='slow' />
                            </div>
                            <div className='border rounded-lg p-4 flex flex-col items-center gap-2'>
                                <p className='text-sm font-medium'>Normal</p>
                                <ZRotationLoader speed='normal' />
                            </div>
                            <div className='border rounded-lg p-4 flex flex-col items-center gap-2'>
                                <p className='text-sm font-medium'>Fast</p>
                                <ZRotationLoader speed='fast' />
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <h2 className='text-lg font-semibold'>Multiple Loaders</h2>
                        <div className='border rounded-lg p-4 flex justify-center gap-4'>
                            <ZRotationLoader size='sm' speed='fast' />
                            <ZRotationLoader size='md' speed='normal' />
                            <ZRotationLoader size='lg' speed='slow' />
                        </div>
                    </div>
                </div>

                <div className='text-center text-sm text-muted-foreground'>
                    <p>
                        This loader combines translateZ (depth movement) with rotateY (horizontal
                        rotation).
                    </p>
                    <p>
                        The animation creates a 3D effect with the cube moving in and out while
                        rotating.
                    </p>
                </div>
            </div>
        </div>
    );
}
