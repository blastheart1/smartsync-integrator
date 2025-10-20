"use client";

import { ExternalLink } from "lucide-react";

interface Spreadsheet {
  id: string;
  name: string;
  url: string;
  lastModified: string;
  owner: string;
  size: number;
}

interface GoogleSheetsBrowserProps {
  spreadsheets: Spreadsheet[];
  loading: boolean;
  onSelect: (spreadsheet: Spreadsheet) => void;
  selectedId?: string;
}

export default function GoogleSheetsBrowser({ 
  spreadsheets, 
  loading, 
  onSelect, 
  selectedId
}: GoogleSheetsBrowserProps) {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (spreadsheets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
        </div>
        <p className="text-gray-600 text-lg mb-2">No spreadsheets found</p>
        <p className="text-gray-500">Make sure you're connected to a Google account.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spreadsheets.map((sheet) => (
        <div 
          key={sheet.id} 
          className={`border rounded-xl p-6 transition-all cursor-pointer ${
            selectedId === sheet.id 
              ? 'border-blue-200 bg-blue-50/50 shadow-sm' 
              : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
          }`}
          onClick={() => onSelect(sheet)}
        >
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-medium text-gray-900 text-lg truncate pr-2">{sheet.name}</h4>
            <a
              href={sheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${sheet.name} in Google Sheets`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>
              <span className="font-medium">Owner:</span> {sheet.owner}
            </p>
            <p>
              <span className="font-medium">Modified:</span> {new Date(sheet.lastModified).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Size:</span> {(sheet.size / 1024).toFixed(1)} KB
            </p>
          </div>
          
          <div className={`px-4 py-2.5 rounded-lg text-sm font-medium text-center transition-colors ${
            selectedId === sheet.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            {selectedId === sheet.id ? 'Selected' : 'Click to Select'}
          </div>
        </div>
      ))}
    </div>
  );
}
