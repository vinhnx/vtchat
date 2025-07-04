'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import type { DocumentEventData, RagEventData } from '@repo/shared/types/analytics';
import { useEffect, useRef } from 'react';
import { useVemetric } from '../hooks/use-vemetric';
import { ANALYTICS_EVENTS } from '../utils/analytics';

/**
 * Comprehensive RAG and document processing tracking
 * Tracks document operations while maintaining PII security
 */
export function VemetricRagTracker() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();

    return null; // This component doesn't render anything
}

/**
 * Hook for tracking RAG and document processing operations
 * Ensures no PII is stored - only metadata and performance metrics
 */
export function useVemetricRagTracking() {
    const { trackEvent, trackPerformance, isEnabled, createTimer } = useVemetric();
    const { data: session } = useSession();

    // Sanitize file names to remove PII
    const sanitizeFileName = (fileName: string): string => {
        const extension = fileName.split('.').pop();
        const sanitized = fileName
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]') // Remove emails
            .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '[date]') // Remove dates
            .replace(/\b\w+\s+\w+\b/g, '[name]'); // Replace potential names

        return extension ? `[document].${extension}` : '[document]';
    };

    const trackDocumentUpload = async (params: {
        fileName: string;
        fileSize: number;
        fileType: string;
        uploadMethod?: 'drag_drop' | 'click_upload' | 'paste';
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: DocumentEventData = {
                documentType: params.fileType,
                fileSize: params.fileSize,
                uploadMethod: params.uploadMethod,
                // Store sanitized filename without PII
                sanitizedFileName: sanitizeFileName(params.fileName),
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.DOCUMENT_UPLOADED, eventData);

            log.info(
                {
                    event: ANALYTICS_EVENTS.DOCUMENT_UPLOADED,
                    fileType: params.fileType,
                    fileSize: params.fileSize,
                },
                'Document upload tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track document upload');
        }
    };

    const trackDocumentProcessing = async (params: {
        fileName: string;
        fileType: string;
        fileSize: number;
        processingTime: number;
        pageCount?: number;
        wordCount?: number;
        extractedEntities?: number;
        success: boolean;
        errorType?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: DocumentEventData = {
                documentType: params.fileType,
                fileSize: params.fileSize,
                processingTime: params.processingTime,
                pageCount: params.pageCount,
                wordCount: params.wordCount,
                extractedEntities: params.extractedEntities,
                success: params.success,
                errorType: params.errorType,
                timestamp: Date.now(),
            };

            if (params.success) {
                await trackEvent(ANALYTICS_EVENTS.DOCUMENT_PROCESSED, eventData);
            } else {
                await trackEvent(ANALYTICS_EVENTS.DOCUMENT_PROCESSING_FAILED, eventData);
            }

            log.info(
                {
                    event: params.success
                        ? ANALYTICS_EVENTS.DOCUMENT_PROCESSED
                        : ANALYTICS_EVENTS.DOCUMENT_PROCESSING_FAILED,
                    fileType: params.fileType,
                    processingTime: params.processingTime,
                    success: params.success,
                },
                'Document processing tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track document processing');
        }
    };

    const trackRagQuery = async (params: {
        queryType: 'semantic' | 'keyword' | 'hybrid';
        queryLength: number;
        documentCount: number;
        retrievalTime: number;
        contextSize: number;
        success: boolean;
        errorType?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: RagEventData = {
                queryType: params.queryType,
                queryLength: params.queryLength,
                documentCount: params.documentCount,
                retrievalTime: params.retrievalTime,
                contextSize: params.contextSize,
                success: params.success,
                errorType: params.errorType,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.RAG_QUERY_EXECUTED, eventData);

            log.debug(
                {
                    queryType: params.queryType,
                    retrievalTime: params.retrievalTime,
                    documentCount: params.documentCount,
                },
                'RAG query tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track RAG query');
        }
    };

    const trackContextRetrieval = async (params: {
        documentCount: number;
        chunkCount: number;
        retrievalTime: number;
        relevanceScore?: number;
        reranked?: boolean;
        cacheHit?: boolean;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: RagEventData = {
                documentCount: params.documentCount,
                chunkCount: params.chunkCount,
                retrievalTime: params.retrievalTime,
                relevanceScore: params.relevanceScore,
                reranked: params.reranked,
                cacheHit: params.cacheHit,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.RAG_CONTEXT_RETRIEVED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track context retrieval');
        }
    };

    const trackDocumentEmbedding = async (params: {
        documentType: string;
        chunkCount: number;
        embeddingTime: number;
        vectorDimension?: number;
        model?: string;
        success: boolean;
        errorType?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = {
                documentType: params.documentType,
                chunkCount: params.chunkCount,
                embeddingTime: params.embeddingTime,
                vectorDimension: params.vectorDimension,
                model: params.model,
                success: params.success,
                errorType: params.errorType,
                timestamp: Date.now(),
            };

            // Using a generic event for now, could add specific embedding event
            await trackEvent(ANALYTICS_EVENTS.DOCUMENT_PROCESSED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track document embedding');
        }
    };

    const trackKnowledgeBaseUpdate = async (params: {
        operation: 'add' | 'remove' | 'update';
        documentCount: number;
        totalSize?: number;
        indexingTime?: number;
        success: boolean;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = {
                operation: params.operation,
                documentCount: params.documentCount,
                totalSize: params.totalSize,
                indexingTime: params.indexingTime,
                success: params.success,
                timestamp: Date.now(),
            };

            // Using existing event or could add specific knowledge base event
            await trackEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
                ...eventData,
                setting: 'knowledge_base',
                action: params.operation,
            });
        } catch (error) {
            log.error({ error }, 'Failed to track knowledge base update');
        }
    };

    const trackDocumentSimilaritySearch = async (params: {
        queryEmbeddingTime: number;
        searchTime: number;
        candidateCount: number;
        resultCount: number;
        similarityThreshold: number;
        success: boolean;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = {
                queryEmbeddingTime: params.queryEmbeddingTime,
                searchTime: params.searchTime,
                candidateCount: params.candidateCount,
                resultCount: params.resultCount,
                similarityThreshold: params.similarityThreshold,
                totalTime: params.queryEmbeddingTime + params.searchTime,
                success: params.success,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track similarity search');
        }
    };

    return {
        trackDocumentUpload,
        trackDocumentProcessing,
        trackRagQuery,
        trackContextRetrieval,
        trackDocumentEmbedding,
        trackKnowledgeBaseUpdate,
        trackDocumentSimilaritySearch,
        createTimer,
        trackPerformance,
        isEnabled,
    };
}
