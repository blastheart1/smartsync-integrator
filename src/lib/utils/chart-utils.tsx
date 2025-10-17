/**
 * Chart utility functions for safe data handling and validation
 */

import React from 'react';

/**
 * Safely format currency values
 */
export function safeFormatCurrency(value: any): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(value));
}

/**
 * Safely format numbers
 */
export function safeFormatNumber(value: any): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  return Number(value).toLocaleString();
}

/**
 * Validate and clean chart data
 */
export function validateChartData(data: any[]): any[] {
  if (!Array.isArray(data)) {
    return [];
  }
  
  return data.filter(item => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    return true;
  }).map(item => {
    // Ensure all numeric values are properly formatted
    const cleaned = { ...item };
    
    // Clean numeric fields
    ['value', 'amount', 'revenue', 'count', 'totalRevenue', 'outstandingBalance'].forEach(field => {
      if (cleaned[field] !== undefined) {
        cleaned[field] = Number(cleaned[field]) || 0;
      }
    });
    
    // Clean string fields
    ['name', 'date', 'range', 'label'].forEach(field => {
      if (cleaned[field] !== undefined) {
        cleaned[field] = String(cleaned[field] || '');
      }
    });
    
    return cleaned;
  });
}

/**
 * Create safe chart container props
 */
export function getSafeChartProps(width: string = "100%", height: string = "100%") {
  return {
    width,
    height,
    minWidth: 250,
    minHeight: 200
  };
}

/**
 * Create safe chart margins
 */
export function getSafeChartMargins() {
  return {
    top: 20,
    right: 30,
    left: 20,
    bottom: 20
  };
}

/**
 * Safe tooltip content creator
 */
export function createSafeTooltipContent(
  active: boolean,
  payload: any[],
  label?: string,
  customFields?: { key: string; label: string; formatter?: (value: any) => string }[]
) {
  if (!active || !payload || !payload.length || !payload[0]?.payload) {
    return null;
  }

  const data = payload[0].payload;
  const fields = customFields || [
    { key: 'value', label: 'Value', formatter: safeFormatCurrency },
    { key: 'amount', label: 'Amount', formatter: safeFormatCurrency },
    { key: 'revenue', label: 'Revenue', formatter: safeFormatCurrency },
    { key: 'count', label: 'Count', formatter: safeFormatNumber }
  ];

  return (
    <div className="bg-white p-3 border rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{label || 'Data Point'}</p>
      {fields.map(({ key, label: fieldLabel, formatter }) => {
        const value = data[key];
        if (value !== undefined) {
          const formattedValue = formatter ? formatter(value) : safeFormatNumber(value);
          return (
            <p key={key} className="text-sm text-gray-600">
              {fieldLabel}: {formattedValue}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}
