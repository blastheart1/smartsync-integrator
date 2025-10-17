import { env } from "@/lib/env";

interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  idToken?: string;
}

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

/**
 * Refresh QuickBooks access token using refresh token
 */
export async function refreshQuickBooksToken(): Promise<TokenInfo> {
  console.log('🔄 Starting QuickBooks token refresh...');
  
  if (!env.QB_REFRESH_TOKEN) {
    throw new Error('No refresh token available');
  }

  const tokenEndpoint = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
  
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env.QB_REFRESH_TOKEN,
  });

  console.log('📤 Making refresh request to:', tokenEndpoint);
  console.log('🔑 Using refresh token:', env.QB_REFRESH_TOKEN.substring(0, 20) + '...');

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${env.QUICKBOOKS_CLIENT_ID}:${env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: body.toString(),
  });

  console.log('📥 Refresh response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Token refresh failed:', errorText);
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: TokenRefreshResponse = await response.json();
  console.log('✅ Token refresh successful');
  console.log('📊 New token info:', {
    accessTokenLength: data.access_token.length,
    refreshTokenLength: data.refresh_token.length,
    expiresIn: data.expires_in,
    refreshExpiresIn: data.x_refresh_token_expires_in
  });

  // Calculate expiration times
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + data.expires_in;
  const refreshExpiresAt = now + data.x_refresh_token_expires_in;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    refreshExpiresAt
  };
}

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60; // 5 minutes in seconds
  return expiresAt <= (now + fiveMinutes);
}

/**
 * Get token expiration info for debugging
 */
export function getTokenExpirationInfo(expiresAt: number): {
  isExpired: boolean;
  expiresIn: number;
  expiresInMinutes: number;
  expiresAtDate: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = expiresAt - now;
  const expiresInMinutes = Math.floor(expiresIn / 60);
  const expiresAtDate = new Date(expiresAt * 1000).toISOString();
  
  return {
    isExpired: expiresIn <= 0,
    expiresIn,
    expiresInMinutes,
    expiresAtDate
  };
}
