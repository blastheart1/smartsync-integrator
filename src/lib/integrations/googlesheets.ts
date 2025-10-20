import { getValidAccessToken } from './googlesheets-token-storage';

interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  lastModified: string;
  owner: string;
  size: number;
}

interface SheetInfo {
  properties: {
    sheetId: number;
    title: string;
    gridProperties: {
      rowCount: number;
      columnCount: number;
    };
  };
}

interface ParsedSheetInfo {
  id: number;
  name: string;
  rowCount: number;
  columnCount: number;
}

interface SpreadsheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    timeZone: string;
  };
  sheets: ParsedSheetInfo[];
}

interface RangeData {
  range: string;
  values: string[][];
}

/**
 * List all spreadsheets for a user
 */
export async function listSpreadsheets(userId: string): Promise<SpreadsheetInfo[]> {
  console.log('[GOOGLE_SHEETS] listSpreadsheets called with userId:', userId);
  
  try {
    console.log('[GOOGLE_SHEETS] Getting valid access token');
    const accessToken = await getValidAccessToken(userId);
    console.log('[GOOGLE_SHEETS] Access token obtained, length:', accessToken.length);
    
    console.log('[GOOGLE_SHEETS] Making API request to Google Drive');
    const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27&fields=files(id,name,webViewLink,modifiedTime,owners,size)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log('[GOOGLE_SHEETS] API response status:', response.status);
    console.log('[GOOGLE_SHEETS] API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[GOOGLE_SHEETS] API request failed with status:', response.status);
      console.error('[GOOGLE_SHEETS] API error response:', error);
      throw new Error(`Failed to list spreadsheets: ${error}`);
    }
    
    console.log('[GOOGLE_SHEETS] Parsing API response');
    const data = await response.json();
    console.log('[GOOGLE_SHEETS] Raw API response:', JSON.stringify(data, null, 2));
    
    console.log('[GOOGLE_SHEETS] Mapping files to SpreadsheetInfo objects');
    const mappedFiles = data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      url: file.webViewLink,
      lastModified: file.modifiedTime,
      owner: file.owners?.[0]?.displayName || 'Unknown',
      size: parseInt(file.size) || 0
    }));
    
    console.log(`[GOOGLE_SHEETS] Mapped ${mappedFiles.length} spreadsheets`);
    console.log('[GOOGLE_SHEETS] Mapped files data:', JSON.stringify(mappedFiles, null, 2));
    
    return mappedFiles;
  } catch (error) {
    console.error('[GOOGLE_SHEETS] Error in listSpreadsheets:', error);
    console.error('[GOOGLE_SHEETS] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[GOOGLE_SHEETS] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[GOOGLE_SHEETS] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

/**
 * Get spreadsheet metadata and sheet information
 */
export async function getSpreadsheetInfo(spreadsheetId: string, userId: string): Promise<SpreadsheetMetadata> {
  console.log('📋 Getting spreadsheet info for:', spreadsheetId);
  
  const accessToken = await getValidAccessToken(userId);
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties,sheets.properties`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get spreadsheet info: ${error}`);
  }
  
  const data = await response.json();
  console.log('📋 Raw spreadsheet data:', data);
  
  // Parse the sheets properly
  const sheets = data.sheets?.map((sheet: any) => ({
    id: sheet.properties.sheetId,
    name: sheet.properties.title,
    rowCount: sheet.properties.gridProperties?.rowCount,
    columnCount: sheet.properties.gridProperties?.columnCount
  })) || [];
  
  console.log('📋 Parsed sheets:', sheets);
  
  return {
    spreadsheetId: data.spreadsheetId,
    properties: {
      title: data.properties?.title || 'Untitled',
      locale: data.properties?.locale || 'en_US',
      timeZone: data.properties?.timeZone || 'America/New_York'
    },
    sheets: sheets
  };
}

/**
 * Read data from a spreadsheet range
 */
export async function readRange(spreadsheetId: string, range: string, userId: string): Promise<RangeData> {
  console.log('📖 Reading range:', range, 'from spreadsheet:', spreadsheetId);
  console.log('📖 User ID:', userId);
  
  try {
    const accessToken = await getValidAccessToken(userId);
    console.log('📖 Access token obtained successfully, length:', accessToken.length);
    
    // Validate inputs
    if (!spreadsheetId || typeof spreadsheetId !== 'string') {
      throw new Error('Spreadsheet ID must be a non-empty string');
    }
    
    if (!range || typeof range !== 'string') {
      throw new Error('Range must be a non-empty string');
    }
    
    // First, let's get the spreadsheet info to see what sheets exist
    console.log('📖 Getting spreadsheet info to check available sheets...');
    const spreadsheetInfo = await getSpreadsheetInfo(spreadsheetId, userId);
    console.log('📖 Available sheets:', spreadsheetInfo.sheets.map(s => s.name));
    
    // Check if we have any sheets
    if (!spreadsheetInfo.sheets || spreadsheetInfo.sheets.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }
    
    // Validate and potentially fix range format
    console.log('📖 Original range:', range);
    
    // Try to normalize the range format
    let normalizedRange = range.trim();
    
    // If range includes sheet name, check if it exists
    if (normalizedRange.includes('!')) {
      const [sheetName, cellRange] = normalizedRange.split('!');
      const sheetExists = spreadsheetInfo.sheets.some(s => s.name === sheetName);
      if (!sheetExists) {
        console.warn(`📖 Sheet "${sheetName}" not found. Available sheets:`, spreadsheetInfo.sheets.map(s => s.name));
        // Use the first available sheet instead
        const firstSheet = spreadsheetInfo.sheets[0];
        normalizedRange = `${firstSheet.name}!${cellRange}`;
        console.log('📖 Using first available sheet:', normalizedRange);
      }
    } else {
      // If no sheet name, use the first available sheet
      const firstSheet = spreadsheetInfo.sheets[0];
      normalizedRange = `${firstSheet.name}!${normalizedRange}`;
      console.log('📖 Added first sheet name:', normalizedRange);
    }
    
    // Use batchGet endpoint which handles ranges better
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet`;
    
    console.log('📖 Using batchGet endpoint');
    console.log('📖 API URL:', apiUrl);
    console.log('📖 Normalized range:', normalizedRange);
    
    const finalUrl = `${apiUrl}?ranges=${encodeURIComponent(normalizedRange)}`;
    console.log('📖 Final URL with range parameter:', finalUrl);
    
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    console.log('📖 Response status:', response.status);
    console.log('📖 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const error = await response.text();
      console.error('📖 Failed to read range');
      console.error('📖 Original range:', range);
      console.error('📖 Spreadsheet ID:', spreadsheetId);
      console.error('📖 Response status:', response.status);
      console.error('📖 Response status text:', response.statusText);
      console.error('📖 Error response:', error);
      
      // Try to parse the error for more specific information
      try {
        const errorData = JSON.parse(error);
        console.error('📖 Parsed error data:', errorData);
        if (errorData.error && errorData.error.message) {
          throw new Error(`Failed to read range "${range}": ${errorData.error.message}`);
        }
      } catch (parseError) {
        console.error('📖 Failed to parse error response:', parseError);
        // If parsing fails, use the original error
      }
      
      throw new Error(`Failed to read range: ${error}`);
    }
    
    const data = await response.json();
    console.log('📖 Successfully received data from Google Sheets API');
    console.log('📖 BatchGet response:', data);
    
    // batchGet returns data in a different format
    if (data.valueRanges && data.valueRanges.length > 0) {
      const valueRange = data.valueRanges[0];
      console.log('📖 Value range:', valueRange);
      
      return {
        range: valueRange.range,
        values: valueRange.values || []
      };
    } else {
      // Fallback to empty data
      return {
        range: range,
        values: []
      };
    }
  } catch (error) {
    console.error('📖 Error in readRange function:', error);
    console.error('📖 Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('📖 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📖 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

/**
 * Append rows to a spreadsheet
 */
export async function appendRows(
  spreadsheetId: string, 
  sheetName: string, 
  values: string[][], 
  userId: string
): Promise<{ updates: { updatedRows: number; updatedColumns: number; updatedCells: number } }> {
  console.log('📝 Appending', values.length, 'rows to sheet:', sheetName);
  
  const accessToken = await getValidAccessToken(userId);
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append rows: ${error}`);
  }
  
  return await response.json();
}

/**
 * Update cells in a spreadsheet range
 */
export async function updateCells(
  spreadsheetId: string, 
  range: string, 
  values: string[][], 
  userId: string
): Promise<{ updatedRows: number; updatedColumns: number; updatedCells: number }> {
  console.log('✏️ Updating range:', range);
  
  const accessToken = await getValidAccessToken(userId);
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update cells: ${error}`);
  }
  
  const result = await response.json();
  return {
    updatedRows: result.updatedRows,
    updatedColumns: result.updatedColumns,
    updatedCells: result.updatedCells
  };
}

/**
 * Batch update multiple ranges in a spreadsheet
 */
export async function batchUpdate(
  spreadsheetId: string, 
  requests: any[], 
  userId: string
): Promise<{ replies: any[] }> {
  console.log('🔄 Batch updating spreadsheet:', spreadsheetId);
  
  const accessToken = await getValidAccessToken(userId);
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: requests
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to batch update: ${error}`);
  }
  
  return await response.json();
}

/**
 * Clear a range in a spreadsheet
 */
export async function clearRange(
  spreadsheetId: string, 
  range: string, 
  userId: string
): Promise<{ clearedRange: string }> {
  console.log('🗑️ Clearing range:', range);
  
  const accessToken = await getValidAccessToken(userId);
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to clear range: ${error}`);
  }
  
  return await response.json();
}
