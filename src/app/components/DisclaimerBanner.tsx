'use client';

import { useState, useEffect } from 'react';

/**
 * Persistent disclaimer banner component for legal protection.
 * Displays required disclaimer text and can be dismissed for 7 days.
 * Reappears automatically after the dismissal period expires.
 */
export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed and if 7 days have passed
    const dismissedTimestamp = localStorage.getItem('disclaimerDismissed');
    if (dismissedTimestamp) {
      const dismissedDate = new Date(parseInt(dismissedTimestamp, 10));
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Show again if 7 days have passed
      if (daysSinceDismissed >= 7) {
        localStorage.removeItem('disclaimerDismissed');
        setIsVisible(true);
      }
    } else {
      // Show if never dismissed
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('disclaimerDismissed', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3" role="alert" aria-live="polite">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        <div className="text-yellow-600 text-lg flex-shrink-0" aria-hidden="true">⚠️</div>
        <p className="text-sm text-gray-700 flex-1">
          <span className="font-semibold text-yellow-700">Disclaimer:</span>{' '}
          Community-reported cases. Not verified by platforms. This site does not determine whether any enforcement action was correct or incorrect.
        </p>
        <button
          onClick={handleDismiss}
          className="text-yellow-700 hover:text-yellow-800 font-medium text-sm px-3 py-1 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss disclaimer banner"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

