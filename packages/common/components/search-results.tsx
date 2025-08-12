'use client';
import { LinkPreviewPopover } from '@repo/common/components';
import type { Source } from '@repo/shared/types';
import { getHost, getHostname } from '@repo/shared/utils';
import { Badge, Flex, LinkFavicon } from '@repo/ui';

export type SearchResultsType = {
    sources: Source[];
};

export const SearchResultsList = ({ sources }: SearchResultsType) => {
    if (!Array.isArray(sources)) {
        return null;
    }

    return (
        <Flex className='w-full' direction='col' gap='md'>
            {Array.isArray(sources) && (
                <Flex className='mb-4 w-full flex-wrap overflow-x-hidden' gap='xs' items='stretch'>
                    {sources.map((source, index) => (
                        <LinkPreviewPopover key={`source-${source.link}-${index}`} source={source}>
                            <Badge
                                onClick={() => {
                                    window?.open(source?.link, '_blank');
                                }}
                                size='md'
                                variant='default'
                            >
                                <LinkFavicon link={getHost(source.link)} />
                                {getHostname(source.link)}
                            </Badge>
                        </LinkPreviewPopover>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};
