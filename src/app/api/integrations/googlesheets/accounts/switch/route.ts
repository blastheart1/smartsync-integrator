import { NextRequest, NextResponse } from "next/server";
import { setActiveAccount } from "@/lib/integrations/googlesheets-token-storage";

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Google Sheets API - Switch Active Account');
    
    const body = await request.json();
    const { accountId } = body;
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    await setActiveAccount(userId, accountId);
    
    console.log('✅ Active account switched to:', accountId);
    
    return NextResponse.json({
      success: true,
      message: 'Active account updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error switching active account:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to switch active account' 
      },
      { status: 500 }
    );
  }
}
