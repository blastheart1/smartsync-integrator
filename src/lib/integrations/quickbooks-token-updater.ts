import { getTokenCacheInfo } from './quickbooks-token-storage';

/**
 * Get current token information for display purposes
 */
export function getCurrentTokenInfo() {
  const cacheInfo = getTokenCacheInfo();
  
  if (cacheInfo.hasCache && cacheInfo.tokenInfo) {
    const { expiresInMinutes, isExpired, expiresAtDate } = cacheInfo.tokenInfo;
    
    return {
      hasToken: true,
      isExpired,
      expiresInMinutes,
      expiresAtDate,
      status: isExpired ? 'expired' : 'valid',
      timeRemaining: isExpired ? 'Expired' : `${expiresInMinutes} minutes`
    };
  }
  
  return {
    hasToken: false,
    isExpired: true,
    expiresInMinutes: 0,
    expiresAtDate: null,
    status: 'no_token',
    timeRemaining: 'No token cached'
  };
}

/**
 * Get token refresh recommendations
 */
export function getTokenRefreshRecommendations() {
  const tokenInfo = getCurrentTokenInfo();
  
  if (!tokenInfo.hasToken) {
    return {
      shouldRefresh: true,
      reason: 'No token cached - should refresh from environment',
      urgency: 'high'
    };
  }
  
  if (tokenInfo.isExpired) {
    return {
      shouldRefresh: true,
      reason: 'Token is expired',
      urgency: 'high'
    };
  }
  
  if (tokenInfo.expiresInMinutes <= 5) {
    return {
      shouldRefresh: true,
      reason: 'Token expires in less than 5 minutes',
      urgency: 'medium'
    };
  }
  
  if (tokenInfo.expiresInMinutes <= 15) {
    return {
      shouldRefresh: false,
      reason: 'Token expires soon but still valid',
      urgency: 'low'
    };
  }
  
  return {
    shouldRefresh: false,
    reason: 'Token is valid for more than 15 minutes',
    urgency: 'none'
  };
}
