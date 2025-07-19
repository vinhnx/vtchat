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
                    className="bg-secondary/90 absolute inset-0 z-10 overflow-hidden rounded-lg"
                    gap="sm"
                    items="center"
                    justify="center"
                >
                    <ImagePlus className="text-muted-foreground" size={16} />
                    <p className="text-muted-foreground text-sm">
                        Drag and drop an image here, or click to select an image
                    </p>
                </Flex>
            )}
        </>
    );
};
