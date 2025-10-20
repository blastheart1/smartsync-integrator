"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface Spreadsheet {
  id: string;
  name: string;
  url: string;
  lastModified: string;
  owner: string;
  size: number;
}

interface GoogleSheetsOperationsProps {
  selectedSpreadsheet?: Spreadsheet;
  spreadsheets: Spreadsheet[];
}

export default function GoogleSheetsOperations({ 
  selectedSpreadsheet, 
  spreadsheets 
}: GoogleSheetsOperationsProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read');
  
  // Read tab state
  const [readLoading, setReadLoading] = useState(false);
  const [readData, setReadData] = useState<string[][]>([]);
  const [readRange, setReadRange] = useState('');
  const [readError, setReadError] = useState<string | null>(null);
  const [readSpreadsheetId, setReadSpreadsheetId] = useState(selectedSpreadsheet?.id || '');
  const [useCustomRange, setUseCustomRange] = useState(false);
  
  // Write tab state
  const [writeLoading, setWriteLoading] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [writeSuccess, setWriteSuccess] = useState<string | null>(null);
  const [writeSpreadsheetId, setWriteSpreadsheetId] = useState(selectedSpreadsheet?.id || '');
  const [writeSheetName, setWriteSheetName] = useState('Sheet1');
  const [writeRowData, setWriteRowData] = useState<string[]>(['', '', '', '']);
  const [writeHeaders, setWriteHeaders] = useState(['Column A', 'Column B', 'Column C', 'Column D']);

  const handleReadData = async () => {
    if (!readSpreadsheetId) {
      setReadError('Please select a spreadsheet');
      return;
    }

    setReadLoading(true);
    setReadError(null);
    
    try {
      // Determine range to use
      let rangeToUse;
      if (useCustomRange && readRange) {
        rangeToUse = readRange;
        console.log('📊 Using custom range:', rangeToUse);
      } else {
        console.log('📊 Auto-detecting data range...');
        rangeToUse = 'A1:Z1000'; // Use a large range to detect actual data
      }
      
      const response = await fetch(
        `/api/integrations/googlesheets/read?spreadsheetId=${readSpreadsheetId}&range=${encodeURIComponent(rangeToUse)}`
      );
      
      const result = await response.json();
      
      if (result.success) {
        const data = result.data.values || [];
        setReadData(data);
        
        // Auto-detect and suggest the optimal range (only if not using custom range)
        if (!useCustomRange && data.length > 0) {
          const detectedRange = detectDataRange(data);
          setReadRange(detectedRange);
          console.log('📊 Auto-detected range:', detectedRange);
        }
      } else {
        setReadError(result.error || 'Failed to read data');
      }
    } catch (error) {
      setReadError('Failed to read data from spreadsheet');
    } finally {
      setReadLoading(false);
    }
  };

  // Helper function to convert column number to letter (A, B, C, ..., Z, AA, AB, etc.)
  const convertToColumnLetter = (columnNumber: number): string => {
    let result = '';
    while (columnNumber > 0) {
      columnNumber--;
      result = String.fromCharCode(65 + (columnNumber % 26)) + result;
      columnNumber = Math.floor(columnNumber / 26);
    }
    return result;
  };

  // Helper function to detect the actual data range
  const detectDataRange = (data: string[][]) => {
    if (!data || data.length === 0) return 'A1:A1';
    
    // Find the last row with data
    let lastRow = 0;
    let lastCol = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row.some(cell => cell && cell.trim() !== '')) {
        lastRow = i + 1;
        for (let j = 0; j < row.length; j++) {
          if (row[j] && row[j].trim() !== '') {
            lastCol = Math.max(lastCol, j + 1);
          }
        }
      }
    }
    
    if (lastRow === 0 || lastCol === 0) return 'A1:A1';
    
    // Convert column number to letter (handle columns beyond Z)
    const colLetter = convertToColumnLetter(lastCol);
    return `A1:${colLetter}${lastRow}`;
  };

  const handleWriteData = async () => {
    if (!writeSpreadsheetId || !writeSheetName) {
      setWriteError('Please select a spreadsheet and enter a sheet name');
      return;
    }

    // Filter out empty values
    const nonEmptyData = writeRowData.filter(value => value.trim() !== '');
    if (nonEmptyData.length === 0) {
      setWriteError('Please enter at least one value');
      return;
    }

    setWriteLoading(true);
    setWriteError(null);
    setWriteSuccess(null);
    
    try {
      const response = await fetch('/api/integrations/googlesheets/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: writeSpreadsheetId,
          operation: 'append',
          sheetName: writeSheetName,
          values: [writeRowData]
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWriteSuccess('Row added successfully!');
        // Clear the form
        setWriteRowData(['', '', '', '']);
      } else {
        setWriteError(result.error || 'Failed to add row');
      }
    } catch (error) {
      setWriteError('Failed to add row to spreadsheet');
    } finally {
      setWriteLoading(false);
    }
  };

  const addWriteColumn = () => {
    setWriteRowData([...writeRowData, '']);
    setWriteHeaders([...writeHeaders, `Column ${String.fromCharCode(65 + writeHeaders.length)}`]);
  };

  const removeWriteColumn = (index: number) => {
    if (writeRowData.length > 1) {
      const newData = writeRowData.filter((_, i) => i !== index);
      const newHeaders = writeHeaders.filter((_, i) => i !== index);
      setWriteRowData(newData);
      setWriteHeaders(newHeaders);
    }
  };

  const updateWriteRowData = (index: number, value: string) => {
    const newData = [...writeRowData];
    newData[index] = value;
    setWriteRowData(newData);
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('read')}
            className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'read'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Read Data
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'write'
                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Write Data
          </button>
        </nav>
      </div>

      {/* Read Tab */}
      {activeTab === 'read' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Read Spreadsheet Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Spreadsheet
                </label>
                <select
                  value={readSpreadsheetId}
                  onChange={(e) => setReadSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a spreadsheet...</option>
                  {spreadsheets.map((sheet) => (
                    <option key={sheet.id} value={sheet.id}>
                      {sheet.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleReadData}
                  disabled={readLoading || !readSpreadsheetId || (useCustomRange && !readRange)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {readLoading ? 'Reading...' : useCustomRange ? 'Read Data' : 'Auto-Detect & Read Data'}
                </button>
              </div>
            </div>

            {/* Custom Range Option */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useCustomRange}
                  onChange={(e) => setUseCustomRange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Specify custom range
                </span>
              </label>
              
              {useCustomRange && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Range (e.g., Sheet1!A1:D10, Data!A:Z)
                  </label>
                  <input
                    type="text"
                    value={readRange}
                    onChange={(e) => setReadRange(e.target.value)}
                    placeholder="Enter range like Sheet1!A1:D10 or just A1:D10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Specify a custom range to read specific data from your spreadsheet
                  </p>
                </div>
              )}
              
              {!useCustomRange && (
                <p className="text-xs text-blue-600 mt-2">
                  🚀 Auto-detect will automatically find and read all data in the selected spreadsheet
                </p>
              )}
            </div>
          </div>

          {/* Results */}
          {readError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{readError}</p>
            </div>
          )}

          {readRange && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                📊 Reading range: <span className="font-mono font-medium">{readRange}</span>
              </p>
            </div>
          )}

          {readData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Data ({readData.length} rows, {readData[0]?.length || 0} columns)
                  </h3>
                  {readSpreadsheetId && (
                    <button
                      onClick={() => {
                        const selectedSheet = spreadsheets.find(s => s.id === readSpreadsheetId);
                        if (selectedSheet) {
                          window.open(selectedSheet.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Open spreadsheet in Google Sheets"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Sheet in Google Sheets
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {readData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Write Tab */}
      {activeTab === 'write' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Row to Spreadsheet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Spreadsheet
                </label>
                <select
                  value={writeSpreadsheetId}
                  onChange={(e) => setWriteSpreadsheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a spreadsheet...</option>
                  {spreadsheets.map((sheet) => (
                    <option key={sheet.id} value={sheet.id}>
                      {sheet.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sheet Name
                </label>
                <input
                  type="text"
                  value={writeSheetName}
                  onChange={(e) => setWriteSheetName(e.target.value)}
                  placeholder="Sheet1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row Data Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Row Data
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={addWriteColumn}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    + Add Column
                  </button>
                  {writeHeaders.length > 1 && (
                    <button
                      onClick={() => removeWriteColumn(writeHeaders.length - 1)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      - Remove Column
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {writeHeaders.map((header, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {header}
                    </label>
                    <input
                      type="text"
                      value={writeRowData[index] || ''}
                      onChange={(e) => updateWriteRowData(index, e.target.value)}
                      placeholder={`Value ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleWriteData}
              disabled={writeLoading || !writeSpreadsheetId || !writeSheetName}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {writeLoading ? 'Adding...' : 'Add Row'}
            </button>
          </div>

          {/* Status Messages */}
          {writeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{writeError}</p>
            </div>
          )}

          {writeSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{writeSuccess}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
