import { useChatStore } from '@repo/common/store';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Download, FileText, X } from 'lucide-react';
import { useState } from 'react';

export const StructuredDataDisplay = () => {
    const structuredData = useChatStore(state => state.structuredData);
    const clearStructuredData = useChatStore(state => state.clearStructuredData);
    const [isExpanded, setIsExpanded] = useState(true);

    if (!structuredData) return null;

    const handleDownload = () => {
        const dataStr = JSON.stringify(structuredData.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `structured-data-${structuredData.fileName}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleClose = () => {
        clearStructuredData();
    };

    const formatValue = (value: any): string => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const renderData = (data: any, level = 0) => {
        if (typeof data !== 'object' || data === null) {
            return <span className="text-sm">{formatValue(data)}</span>;
        }

        return (
            <div className={`${level > 0 ? 'ml-4' : ''} space-y-2`}>
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="border-muted border-l-2 pl-3">
                        <div className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-muted-foreground">
                            {typeof value === 'object' && value !== null ? (
                                renderData(value, level + 1)
                            ) : (
                                <span className="text-sm">{formatValue(value)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-600" />
                        <CardTitle className="text-sm">
                            Structured Data - {structuredData.type}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setIsExpanded(!isExpanded)}
                            tooltip={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <FileText size={14} className={isExpanded ? 'rotate-90' : ''} />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleDownload}
                            tooltip="Download JSON"
                        >
                            <Download size={14} />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleClose}
                            tooltip="Close"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                </div>
                <div className="text-muted-foreground text-xs">
                    From: {structuredData.fileName} • Extracted:{' '}
                    {new Date(structuredData.extractedAt!).toLocaleString()}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0">
                    <div className="max-h-96 overflow-y-auto">
                        {renderData(structuredData.data)}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
