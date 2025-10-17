import { refreshQuickBooksToken, isTokenExpired, getTokenExpirationInfo } from './quickbooks-token-refresh';
import { env } from '@/lib/env';

interface StoredTokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
  lastUpdated: number;
}

// In-memory token storage (in production, use a database or secure storage)
let tokenCache: StoredTokenInfo | null = null;

/**
 * Get current valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string> {
  console.log('🔍 Getting valid QuickBooks access token...');
  
  // Check if we have a cached token
  if (tokenCache) {
    console.log('📋 Found cached token');
    const tokenInfo = getTokenExpirationInfo(tokenCache.expiresAt);
    console.log('⏰ Token expires in:', tokenInfo.expiresInMinutes, 'minutes');
    
    if (!isTokenExpired(tokenCache.expiresAt)) {
      console.log('✅ Using cached valid token');
      return tokenCache.accessToken;
    } else {
      console.log('⚠️ Cached token is expired, refreshing...');
    }
  } else {
    console.log('📋 No cached token found, attempting to refresh from environment');
    
    // If no cached token, try to refresh from environment refresh token
    if (env.QB_REFRESH_TOKEN) {
      console.log('🔄 Attempting to refresh token from environment refresh token');
      try {
        const newTokenInfo = await refreshQuickBooksToken();
        
        // Update cache
        tokenCache = {
          accessToken: newTokenInfo.accessToken,
          refreshToken: newTokenInfo.refreshToken,
          expiresAt: newTokenInfo.expiresAt,
          refreshExpiresAt: newTokenInfo.refreshExpiresAt,
          lastUpdated: Math.floor(Date.now() / 1000)
        };
        
        console.log('✅ Token refreshed and cached successfully from environment');
        return newTokenInfo.accessToken;
        
      } catch (error) {
        console.error('❌ Failed to refresh from environment refresh token:', error);
        
        // Fall back to environment access token if available
        if (env.QB_ACCESS_TOKEN) {
          console.log('🔄 Falling back to environment access token');
          return env.QB_ACCESS_TOKEN;
        }
        
        throw error;
      }
    } else if (env.QB_ACCESS_TOKEN) {
      // For environment tokens, we don't know expiration time, so we'll try to use it
      // and refresh if API calls fail with 401
      console.log('🔑 Using environment access token (no refresh token available)');
      return env.QB_ACCESS_TOKEN;
    } else {
      console.log('❌ No access token or refresh token available');
      throw new Error('No access token or refresh token available');
    }
  }

  // Refresh the token
  try {
    const newTokenInfo = await refreshQuickBooksToken();
    
    // Update cache
    tokenCache = {
      accessToken: newTokenInfo.accessToken,
      refreshToken: newTokenInfo.refreshToken,
      expiresAt: newTokenInfo.expiresAt,
      refreshExpiresAt: newTokenInfo.refreshExpiresAt,
      lastUpdated: Math.floor(Date.now() / 1000)
    };
    
    console.log('✅ Token refreshed and cached successfully');
    return newTokenInfo.accessToken;
    
  } catch (error) {
    console.error('❌ Failed to refresh token:', error);
    
    // If refresh fails and we have an environment token, try using it
    if (env.QB_ACCESS_TOKEN) {
      console.log('🔄 Falling back to environment token');
      return env.QB_ACCESS_TOKEN;
    }
    
    throw error;
  }
}

/**
 * Clear cached tokens (useful for testing or manual refresh)
 */
export function clearTokenCache(): void {
  console.log('🗑️ Clearing token cache');
  tokenCache = null;
}

/**
 * Get token cache info for debugging
 */
export function getTokenCacheInfo(): {
  hasCache: boolean;
  tokenInfo?: {
    expiresIn: number;
    expiresInMinutes: number;
    expiresAtDate: string;
    isExpired: boolean;
  };
} {
  if (!tokenCache) {
    return { hasCache: false };
  }

  const tokenInfo = getTokenExpirationInfo(tokenCache.expiresAt);
  
  return {
    hasCache: true,
    tokenInfo: {
      expiresIn: tokenInfo.expiresIn,
      expiresInMinutes: tokenInfo.expiresInMinutes,
      expiresAtDate: tokenInfo.expiresAtDate,
      isExpired: tokenInfo.isExpired
    }
  };
}

/**
 * Force refresh token (useful for manual refresh)
 */
export async function forceRefreshToken(): Promise<string> {
  console.log('🔄 Force refreshing QuickBooks token...');
  clearTokenCache();
  return await getValidAccessToken();
}

/**
 * Handle 401 errors by refreshing token and retrying
 */
export async function handle401Error(originalFunction: () => Promise<any>): Promise<any> {
  console.log('🚨 401 error detected, attempting token refresh...');
  
  try {
    // Clear cache and refresh token
    clearTokenCache();
    await getValidAccessToken();
    
    console.log('✅ Token refreshed, retrying original request...');
    
    // Retry the original function
    return await originalFunction();
    
  } catch (error) {
    console.error('❌ Failed to refresh token after 401 error:', error);
    throw error;
  }
}
