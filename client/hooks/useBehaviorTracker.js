import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export function useBehaviorTracker(auctionId) {
    const pageEnterTime = useRef(Date.now());
    const hasTrackedView = useRef(false);

    // Track time-on-page when user leaves or hides the tab
    useEffect(() => {
        if (!auctionId) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const timeSpent = (Date.now() - pageEnterTime.current) / 1000;
                // Only track if they spent more than 5 seconds (ignore bounces)
                if (timeSpent > 5) {
                    trackEvent('time_on_page', { timeSpent });
                }
            } else {
                // Reset timer when they come back
                pageEnterTime.current = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Also track when component unmounts (navigating away)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            const timeSpent = (Date.now() - pageEnterTime.current) / 1000;
            if (timeSpent > 5) {
                trackEvent('time_on_page', { timeSpent });
            }
        };
    }, [auctionId]);

    const trackEvent = (eventType, metadata = {}) => {
        if (!auctionId && eventType !== 'category_browse' && eventType !== 'search_query') return;

        // Fire-and-forget API call — never await or block UI
        api('/api/events/track', {
            method: 'POST',
            body: JSON.stringify({ auctionId, eventType, metadata })
        }).catch((err) => {
            console.warn('[BehaviorTracker] Failed to track event:', eventType, err.message);
        });
    };

    // Helper for IntersectionObserver (used by feed cards)
    const trackViewOnce = () => {
        if (hasTrackedView.current || !auctionId) return;
        hasTrackedView.current = true;
        trackEvent('item_view', { source: 'feed' });
    };

    return { trackEvent, trackViewOnce };
}
