import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorAlert({
  message = 'An error occurred while fetching data.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`bg-[#FDF2F2] border border-[#F8D7DA] text-[#721C24] rounded-lg p-4 flex items-start gap-3.5 text-xs shadow-xs ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-[#DC3545] flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold text-sm text-[#721C24]">Unable to complete request</p>
        <p className="text-[#842029] mt-0.5 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#F5C2C7] text-[#842029] rounded-md hover:bg-[#F8D7DA] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
}
