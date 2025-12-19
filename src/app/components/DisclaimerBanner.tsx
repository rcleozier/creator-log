'use client';

export function DisclaimerBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3">
        <div className="text-yellow-600 text-lg flex-shrink-0">⚠️</div>
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-yellow-700">Disclaimer:</span>{' '}
          Community-reported claims; not verified by YouTube or any official source. 
          This tracker is for transparency and informational purposes only.
        </p>
      </div>
    </div>
  );
}

