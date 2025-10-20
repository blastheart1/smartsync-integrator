import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔌 Google Account Disconnect - Starting');
    
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Get account to revoke tokens
    const account = await prisma.googleAccount.findUnique({
      where: { id: accountId }
    });
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Revoke tokens with Google
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: account.accessToken,
        }),
      });
      console.log('✅ Tokens revoked with Google');
    } catch (error) {
      console.warn('⚠️ Failed to revoke tokens with Google:', error);
      // Continue with deletion even if revocation fails
    }
    
    // Delete account and all related data from database
    await prisma.googleAccount.delete({
      where: { id: accountId }
    });
    
    console.log('✅ Google account disconnected and deleted');
    
    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully'
    });
    
  } catch (error) {
    console.error('❌ Error disconnecting Google account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
