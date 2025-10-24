import { PrismaClient } from "@prisma/client";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

interface GoogleAccount {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  avatar?: string;
  isActive: boolean;
  lastUsed?: Date;
}

/**
 * Get valid access token for a specific account, refreshing if necessary
 */
export async function getValidAccessToken(userId: string, accountId?: string): Promise<string> {
  console.log('[TOKEN_STORAGE] getValidAccessToken called with userId:', userId, 'accountId:', accountId);
  const prisma = new PrismaClient();
  
  try {
    // If no accountId specified, get the active account
    if (!accountId) {
      console.log('[TOKEN_STORAGE] No accountId specified, getting active account');
      const activeAccount = await getActiveAccount(userId);
      if (!activeAccount) {
        console.error('[TOKEN_STORAGE] No active Google account found');
        throw new Error('No active Google account found');
      }
      accountId = activeAccount.id;
      console.log('[TOKEN_STORAGE] Active account found:', accountId);
    }
  
    console.log('[TOKEN_STORAGE] Querying database for account:', accountId);
    const account = await prisma.googleAccount.findUnique({
      where: { id: accountId }
    });
    
    if (!account) {
      console.error('[TOKEN_STORAGE] Google account not found:', accountId);
      throw new Error('Google account not found');
    }
    
    console.log('[TOKEN_STORAGE] Account found, checking token expiry');
    // Check if token is expired
    const isExpired = new Date() >= new Date(account.expiresAt);
    console.log('[TOKEN_STORAGE] Token expired:', isExpired, 'Expires at:', account.expiresAt);
    
    if (!isExpired) {
      console.log('[TOKEN_STORAGE] Using valid cached token');
      // Update last used timestamp
      await prisma.googleAccount.update({
        where: { id: accountId },
        data: { lastUsed: new Date() }
      });
      return account.accessToken;
    }
    
    console.log('[TOKEN_STORAGE] Token expired, refreshing...');
    
    try {
      const newTokenInfo = await refreshGoogleToken(account.refreshToken);
      
      // Update account with new tokens
      const updatedAccount = await prisma.googleAccount.update({
        where: { id: accountId },
        data: {
          accessToken: newTokenInfo.access_token,
          refreshToken: newTokenInfo.refresh_token || account.refreshToken,
          expiresAt: new Date(Date.now() + (newTokenInfo.expires_in * 1000)),
          scope: newTokenInfo.scope || account.scope,
          lastUsed: new Date()
        }
      });
      
      console.log('[TOKEN_STORAGE] Token refreshed successfully');
      return updatedAccount.accessToken;
      
    } catch (error) {
      console.error('[TOKEN_STORAGE] Failed to refresh token:', error);
      console.error('[TOKEN_STORAGE] Refresh error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('[TOKEN_STORAGE] Refresh error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('[TOKEN_STORAGE] Refresh error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error('Failed to refresh Google access token');
    }
  } catch (error) {
    console.error('[TOKEN_STORAGE] Error in getValidAccessToken:', error);
    console.error('[TOKEN_STORAGE] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[TOKEN_STORAGE] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[TOKEN_STORAGE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Refresh Google access token using refresh token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }
  
  return await response.json();
}

/**
 * Get all Google accounts for a user
 */
export async function listUserAccounts(userId: string): Promise<GoogleAccount[]> {
  console.log('[TOKEN_STORAGE] listUserAccounts called with userId:', userId);
  const prisma = new PrismaClient();
  
  try {
    console.log('[TOKEN_STORAGE] Querying database for Google accounts');
    const accounts = await prisma.googleAccount.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' }
    });
    
    console.log(`[TOKEN_STORAGE] Found ${accounts.length} raw accounts from database`);
    console.log('[TOKEN_STORAGE] Raw accounts data:', JSON.stringify(accounts, null, 2));
    
    const mappedAccounts = accounts.map(account => ({
      id: account.id,
      email: account.email,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      expiresAt: account.expiresAt,
      scope: account.scope,
      avatar: account.avatar || undefined,
      isActive: account.isActive,
      lastUsed: account.lastUsed || undefined
    }));
    
    console.log(`[TOKEN_STORAGE] Mapped ${mappedAccounts.length} accounts for return`);
    console.log('[TOKEN_STORAGE] Mapped accounts data:', JSON.stringify(mappedAccounts, null, 2));
    
    return mappedAccounts;
  } catch (error) {
    console.error('[TOKEN_STORAGE] Error in listUserAccounts:', error);
    console.error('[TOKEN_STORAGE] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[TOKEN_STORAGE] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[TOKEN_STORAGE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get the active Google account for a user
 */
export async function getActiveAccount(userId: string): Promise<GoogleAccount | null> {
  const prisma = new PrismaClient();
  
  try {
    const account = await prisma.googleAccount.findFirst({
      where: { 
        userId,
        isActive: true 
      },
      orderBy: { lastUsed: 'desc' }
    });
    
    if (!account) {
      return null;
    }
    
    return {
      id: account.id,
      email: account.email,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      expiresAt: account.expiresAt,
      scope: account.scope,
      avatar: account.avatar || undefined,
      isActive: account.isActive,
      lastUsed: account.lastUsed || undefined
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Set active account for a user
 */
export async function setActiveAccount(userId: string, accountId: string): Promise<void> {
  // Set all accounts to inactive
  await prisma.googleAccount.updateMany({
    where: { userId },
    data: { isActive: false }
  });
  
  // Set the specified account as active
  await prisma.googleAccount.update({
    where: { id: accountId },
    data: { 
      isActive: true,
      lastUsed: new Date()
    }
  });
  
  console.log('✅ Active Google account updated');
}

/**
 * Get token cache info for debugging
 */
export async function getTokenCacheInfo(userId: string, accountId?: string): Promise<{
  hasCache: boolean;
  tokenInfo?: {
    expiresIn: number;
    expiresInMinutes: number;
    expiresAtDate: string;
    isExpired: boolean;
    email: string;
  };
}> {
  try {
    const account = accountId 
      ? await prisma.googleAccount.findUnique({ where: { id: accountId } })
      : await getActiveAccount(userId);
    
    if (!account) {
      return { hasCache: false };
    }
    
    const now = new Date();
    const expiresAt = new Date(account.expiresAt);
    const expiresIn = Math.max(0, expiresAt.getTime() - now.getTime());
    const expiresInMinutes = Math.floor(expiresIn / (1000 * 60));
    const isExpired = now >= expiresAt;
    
    return {
      hasCache: true,
      tokenInfo: {
        expiresIn,
        expiresInMinutes,
        expiresAtDate: expiresAt.toISOString(),
        isExpired,
        email: account.email
      }
    };
  } catch (error) {
    console.error('Error getting token cache info:', error);
    return { hasCache: false };
  }
}
