import { NextRequest, NextResponse } from "next/server";
import { listUserAccounts } from "@/lib/integrations/googlesheets-token-storage";

export async function GET(request: NextRequest) {
  console.log('[GOOGLE_ACCOUNTS_API] Starting GET request');
  
  try {
    console.log('[GOOGLE_ACCOUNTS_API] Getting userId from session (hardcoded for now)');
    const userId = "1";
    
    console.log('[GOOGLE_ACCOUNTS_API] Calling listUserAccounts function');
    const accounts = await listUserAccounts(userId);
    
    console.log(`[GOOGLE_ACCOUNTS_API] Found ${accounts.length} Google accounts`);
    console.log('[GOOGLE_ACCOUNTS_API] Accounts data:', JSON.stringify(accounts, null, 2));
    
    return NextResponse.json({
      success: true,
      data: accounts
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('[GOOGLE_ACCOUNTS_API] Error occurred:', error);
    console.error('[GOOGLE_ACCOUNTS_API] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[GOOGLE_ACCOUNTS_API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[GOOGLE_ACCOUNTS_API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list Google accounts' 
      },
      { 
        status: 500,
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
