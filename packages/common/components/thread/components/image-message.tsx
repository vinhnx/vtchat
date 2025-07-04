import { CornerDownRight } from 'lucide-react';

export const ImageMessage = ({ imageAttachment }: { imageAttachment: string }) => {
    return (
        <div className="flex flex-row items-center gap-2 p-1">
            <CornerDownRight className="text-muted-foreground/50" size={16} />
            <div className="relative flex w-12 flex-row items-center gap-2 ">
                <img alt="image" className="relative inset-0 rounded-lg" src={imageAttachment} />
            </div>
        </div>
    );
};
