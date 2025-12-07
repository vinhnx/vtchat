'use client';

import { useEffect } from 'react';

/**
 * Component to manage canonical URLs by removing unwanted query parameters
 * that cause duplicate content issues for search engines
 */
export function CanonicalURLManager() {
    useEffect(() => {
        // Create canonical URL by removing ref parameters and other tracking parameters
        const url = new URL(window.location.href);
        const originalParams = new URLSearchParams(url.search);

        // Parameters to remove for canonical URL
        const paramsToRemove = [
            'ref',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'gclid',
            'fbclid',
            'ref_src',
            'source',
        ];

        let hasChanges = false;
        paramsToRemove.forEach(param => {
            if (originalParams.has(param)) {
                originalParams.delete(param);
                hasChanges = true;
            }
        });

        // If we removed any parameters, update the canonical URL
        if (hasChanges) {
            const canonicalUrl = new URL(url.origin + url.pathname);
            canonicalUrl.search = originalParams.toString();

            // Update or create canonical link tag
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (canonicalLink) {
                canonicalLink.setAttribute('href', canonicalUrl.toString());
            } else {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                canonicalLink.setAttribute('href', canonicalUrl.toString());
                document.head.appendChild(canonicalLink);
            }

            // If the current URL has tracking parameters, replace the browser history
            // to avoid the parameters being indexed
            if (url.search !== canonicalUrl.search) {
                window.history.replaceState({}, '', canonicalUrl.toString());
            }
        } else {
            // Ensure canonical link exists for the current URL
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                canonicalLink.setAttribute('href', url.origin + url.pathname);
                document.head.appendChild(canonicalLink);
            }
        }
    }, []);

    return null;
}
