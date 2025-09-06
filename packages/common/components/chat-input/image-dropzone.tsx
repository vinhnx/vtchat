import { Flex } from '@repo/ui';
import { ImagePlus } from 'lucide-react';
import type { FC } from 'react';
import type { DropzoneState } from 'react-dropzone';

export type TImageDropzone = {
    dropzonProps: DropzoneState;
};
export const ImageDropzone: FC<TImageDropzone> = ({ dropzonProps }) => {
    return (
        <>
            <input {...dropzonProps.getInputProps()} />
            {dropzonProps.isDragActive && (
                <Flex
                    className='bg-background/80 absolute inset-0 z-10 overflow-hidden rounded-lg backdrop-blur-sm'
                    gap='sm'
                    items='center'
                    justify='center'
                >
                    <div className='border-border/60 text-muted-foreground flex flex-col items-center gap-2 rounded-lg border-2 border-dashed bg-transparent px-6 py-4'>
                        <ImagePlus className='text-muted-foreground' size={20} />
                        <p className='text-xs'>Drop image to attach</p>
                    </div>
                </Flex>
            )}
        </>
    );
};
