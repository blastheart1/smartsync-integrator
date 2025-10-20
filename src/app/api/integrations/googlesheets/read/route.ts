import { NextRequest, NextResponse } from "next/server";
import { readRange, getSpreadsheetInfo } from "@/lib/integrations/googlesheets";

export async function GET(request: NextRequest) {
  console.log('[GOOGLE_READ_API] Starting GET request');
  
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    const range = searchParams.get('range');
    const info = searchParams.get('info') === 'true';
    
    console.log('[GOOGLE_READ_API] Request params:', { spreadsheetId, range, info });
    
    if (!spreadsheetId) {
      console.error('[GOOGLE_READ_API] Missing spreadsheetId');
      return NextResponse.json(
        { success: false, error: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    if (info) {
      console.log('[GOOGLE_READ_API] Getting spreadsheet info');
      const spreadsheetInfo = await getSpreadsheetInfo(spreadsheetId, userId);
      
      return NextResponse.json({
        success: true,
        data: spreadsheetInfo
      });
    }
    
    // Read data from range
    const defaultRange = range || 'Sheet1!A1:Z1000';
    console.log('[GOOGLE_READ_API] Reading range:', defaultRange);
    const data = await readRange(spreadsheetId, defaultRange, userId);
    
    console.log(`[GOOGLE_READ_API] Successfully read data from range: ${data.range}`);
    
    return NextResponse.json({
      success: true,
      data: {
        range: data.range,
        values: data.values,
        rowCount: data.values.length,
        columnCount: data.values[0]?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[GOOGLE_READ_API] Error occurred:', error);
    console.error('[GOOGLE_READ_API] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[GOOGLE_READ_API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[GOOGLE_READ_API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read spreadsheet data' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('[GOOGLE_READ_API] Starting POST request');
  
  try {
    const body = await request.json();
    const { spreadsheetId, range, info } = body;
    
    console.log('[GOOGLE_READ_API] Request body:', { spreadsheetId, range, info });
    
    if (!spreadsheetId) {
      console.error('[GOOGLE_READ_API] Missing spreadsheetId');
      return NextResponse.json(
        { success: false, error: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    if (info) {
      console.log('[GOOGLE_READ_API] Getting spreadsheet info');
      const spreadsheetInfo = await getSpreadsheetInfo(spreadsheetId, userId);
      
      return NextResponse.json({
        success: true,
        data: spreadsheetInfo
      });
    }
    
    // Read data from range
    const defaultRange = range || 'Sheet1!A1:Z1000';
    console.log('[GOOGLE_READ_API] Reading range:', defaultRange);
    const data = await readRange(spreadsheetId, defaultRange, userId);
    
    console.log(`[GOOGLE_READ_API] Successfully read data from range: ${data.range}`);
    
    return NextResponse.json({
      success: true,
      data: {
        range: data.range,
        values: data.values,
        rowCount: data.values.length,
        columnCount: data.values[0]?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[GOOGLE_READ_API] Error occurred:', error);
    console.error('[GOOGLE_READ_API] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[GOOGLE_READ_API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[GOOGLE_READ_API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read spreadsheet data' 
      },
      { status: 500 }
    );
  }
}
