import { NextRequest, NextResponse } from "next/server";
import { listSpreadsheets } from "@/lib/integrations/googlesheets";

export async function GET(request: NextRequest) {
  console.log('[GOOGLE_SPREADSHEETS_API] Starting GET request');
  
  try {
    console.log('[GOOGLE_SPREADSHEETS_API] Getting userId from session (hardcoded for now)');
    const userId = "1";
    
    console.log('[GOOGLE_SPREADSHEETS_API] Calling listSpreadsheets function');
    const spreadsheets = await listSpreadsheets(userId);
    
    console.log(`[GOOGLE_SPREADSHEETS_API] Found ${spreadsheets.length} spreadsheets`);
    console.log('[GOOGLE_SPREADSHEETS_API] Spreadsheets data:', JSON.stringify(spreadsheets, null, 2));
    
    return NextResponse.json({
      success: true,
      data: spreadsheets
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('[GOOGLE_SPREADSHEETS_API] Error occurred:', error);
    console.error('[GOOGLE_SPREADSHEETS_API] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[GOOGLE_SPREADSHEETS_API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[GOOGLE_SPREADSHEETS_API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : 'Failed to list spreadsheets';
    const isAuthError = errorMessage.includes('No active Google account') || 
                       errorMessage.includes('Google account not found') ||
                       errorMessage.includes('No valid access token');
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        requiresAuth: isAuthError
      },
      { 
        status: isAuthError ? 401 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
