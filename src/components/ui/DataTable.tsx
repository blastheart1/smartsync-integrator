"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Download, Filter, ChevronDown } from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title: string;
  searchable?: boolean;
  exportable?: boolean;
  onExport?: () => void;
}

export default function DataTable({ 
  data, 
  columns, 
  title, 
  searchable = true, 
  exportable = true,
  onExport 
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    columns.some((column) => {
      const value = row[column.key];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const exportToCSV = () => {
    if (!filteredData.length) return;
    
    const headers = columns.map(col => col.label).join(",");
    const rows = filteredData.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Handle nested object values (e.g., vendor.name)
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          const nestedValue = keys.reduce((obj, key) => obj?.[key], row);
          return `"${nestedValue || ""}"`;
        }
        return typeof value === "object" ? JSON.stringify(value) : `"${value || ""}"`;
      }).join(",")
    );
    
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    if (!filteredData.length) return;
    
    // Clean up the data for JSON export
    const cleanedData = filteredData.map(row => {
      const cleanedRow: any = {};
      columns.forEach(col => {
        let value = row[col.key];
        
        // Handle nested object values
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], row);
        }
        
        // Clean up the value
        if (typeof value === 'object' && value !== null) {
          cleanedRow[col.label] = value;
        } else {
          cleanedRow[col.label] = value || '';
        }
      });
      return cleanedRow;
    });

    const jsonContent = JSON.stringify(cleanedData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_export.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    if (!filteredData.length) return;
    
    // Create HTML table for Excel format
    let htmlContent = `
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filteredData.map(row => `
            <tr>
              ${columns.map(col => {
                let value = row[col.key];
                
                // Handle nested object values
                if (col.key.includes('.')) {
                  const keys = col.key.split('.');
                  value = keys.reduce((obj, key) => obj?.[key], row);
                }
                
                return `<td>${value || ''}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_export.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {exportable && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={exportToCSV}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Export as CSV
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Export as JSON
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Export as Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-blue-600">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length > 0 ? (
              sortedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? "No results found for your search" : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {sortedData.length} of {data.length} records
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </div>
      )}
    </div>
  );
}
