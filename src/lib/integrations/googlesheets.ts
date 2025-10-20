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

interface SpreadsheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    timeZone: string;
  };
  sheets: SheetInfo[];
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
  
  return await response.json();
}

/**
 * Read data from a spreadsheet range
 */
export async function readRange(spreadsheetId: string, range: string, userId: string): Promise<RangeData> {
  console.log('📖 Reading range:', range, 'from spreadsheet:', spreadsheetId);
  
  const accessToken = await getValidAccessToken(userId);
  
  // Handle range encoding properly for Google Sheets API
  let apiRange = range;
  if (range.includes('!')) {
    // Range includes sheet name, encode sheet name but keep the ! and cell range
    const [sheetName, cellRange] = range.split('!');
    apiRange = `${encodeURIComponent(sheetName)}!${cellRange}`;
  } else {
    // Just a cell range, encode it
    apiRange = encodeURIComponent(range);
  }
  
  console.log('📖 Using API range:', apiRange);
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${apiRange}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('📖 Failed to read range. API range used:', apiRange);
    console.error('📖 Error response:', error);
    throw new Error(`Failed to read range: ${error}`);
  }
  
  const data = await response.json();
  
  return {
    range: data.range,
    values: data.values || []
  };
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
