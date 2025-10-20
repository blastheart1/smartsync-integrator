import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    console.log('🔐 Google OAuth Initiation - Starting');
    
    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session/cookie for validation (simplified - in production use secure session storage)
    const response = NextResponse.redirect(generateGoogleAuthUrl(state));
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });
    
    console.log('✅ Google OAuth URL generated, redirecting to Google');
    return response;
    
  } catch (error) {
    console.error('❌ Error initiating Google OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}

function generateGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
