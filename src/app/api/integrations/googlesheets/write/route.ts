import { NextRequest, NextResponse } from "next/server";
import { appendRows, updateCells, clearRange } from "@/lib/integrations/googlesheets";

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Google Sheets API - Write Data');
    
    const body = await request.json();
    const { spreadsheetId, operation, sheetName, range, values, clear } = body;
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    let result;
    
    if (clear) {
      // Clear range
      if (!range) {
        return NextResponse.json(
          { success: false, error: 'Range is required for clear operation' },
          { status: 400 }
        );
      }
      
      result = await clearRange(spreadsheetId, range, userId);
      console.log(`✅ Cleared range: ${result.clearedRange}`);
      
    } else if (operation === 'append') {
      // Append rows
      if (!sheetName || !values || !Array.isArray(values)) {
        return NextResponse.json(
          { success: false, error: 'Sheet name and values array are required for append operation' },
          { status: 400 }
        );
      }
      
      result = await appendRows(spreadsheetId, sheetName, values, userId);
      console.log(`✅ Appended ${result.updates.updatedRows} rows`);
      
    } else if (operation === 'update') {
      // Update cells
      if (!range || !values || !Array.isArray(values)) {
        return NextResponse.json(
          { success: false, error: 'Range and values array are required for update operation' },
          { status: 400 }
        );
      }
      
      result = await updateCells(spreadsheetId, range, values, userId);
      console.log(`✅ Updated ${result.updatedCells} cells`);
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid operation. Use "append", "update", or "clear"' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error writing to spreadsheet:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write to spreadsheet' 
      },
      { status: 500 }
    );
  }
}
