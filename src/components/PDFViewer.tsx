import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

export function PDFViewer({ url, fileName, onClose }: PDFViewerProps) {
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 w-full h-full relative">
          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">Failed to load PDF</p>
              <p className="text-sm text-gray-600 mt-2">
                Please try downloading the file instead
              </p>
            </div>
          ) : (
            <iframe
              src={`${url}#toolbar=1`}
              className="w-full h-full rounded-b-lg"
              title={fileName}
              onError={() => setLoadError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}