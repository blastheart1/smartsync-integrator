import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Google OAuth Callback - Processing');
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for OAuth errors
    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations/googlesheets?error=${encodeURIComponent(error)}`);
    }
    
    if (!code || !state) {
      console.error('❌ Missing code or state parameter');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations/googlesheets?error=missing_parameters`);
    }
    
    // Validate state parameter
    const storedState = request.cookies.get('google_oauth_state')?.value;
    if (state !== storedState) {
      console.error('❌ Invalid state parameter');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations/googlesheets?error=invalid_state`);
    }
    
    console.log('✅ Validating OAuth parameters');
    
    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    console.log('✅ Tokens received from Google');
    
    // Get user info from Google
    const userInfo = await getUserInfo(tokenResponse.access_token);
    console.log('✅ User info retrieved:', userInfo.email);
    
    // Store tokens in database (using userId = "1" for now - in production use actual session user)
    const userId = "1"; // TODO: Get from session
    
    // Check if account already exists
    let googleAccount = await prisma.googleAccount.findFirst({
      where: {
        userId: userId,
        email: userInfo.email
      }
    });
    
    if (googleAccount) {
      // Update existing account
      googleAccount = await prisma.googleAccount.update({
        where: { id: googleAccount.id },
        data: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token || googleAccount.refreshToken,
          expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
          scope: tokenResponse.scope || '',
          avatar: userInfo.picture,
          isActive: true,
          lastUsed: new Date()
        }
      });
      console.log('✅ Updated existing Google account');
    } else {
      // Create new account
      googleAccount = await prisma.googleAccount.create({
        data: {
          userId: userId,
          email: userInfo.email,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token || '',
          expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
          scope: tokenResponse.scope || '',
          avatar: userInfo.picture,
          isActive: true,
          lastUsed: new Date()
        }
      });
      console.log('✅ Created new Google account');
    }
    
    // Clear OAuth state cookie
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations/googlesheets?connected=true`);
    response.cookies.delete('google_oauth_state');
    
    return response;
    
  } catch (error) {
    console.error('❌ Error in Google OAuth callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/integrations/googlesheets?error=callback_error`);
  }
}

async function exchangeCodeForTokens(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: env.GOOGLE_REDIRECT_URI,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  return await response.json();
}

async function getUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user info');
  }
  
  return await response.json();
}
