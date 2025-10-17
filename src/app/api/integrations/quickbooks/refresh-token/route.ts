import { NextRequest, NextResponse } from 'next/server';
import { forceRefreshToken, getTokenCacheInfo, clearTokenCache } from '@/lib/integrations/quickbooks-token-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual token refresh requested');
    
    const newAccessToken = await forceRefreshToken();
    const cacheInfo = getTokenCacheInfo();
    
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      tokenInfo: cacheInfo,
      accessTokenLength: newAccessToken.length
    });
    
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Token refresh failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Token status requested');
    
    const cacheInfo = getTokenCacheInfo();
    
    return NextResponse.json({
      success: true,
      tokenInfo: cacheInfo,
      message: cacheInfo.hasCache ? 'Token cache found' : 'No token cache'
    });
    
  } catch (error) {
    console.error('❌ Token status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Token status check failed'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Token cache clear requested');
    
    clearTokenCache();
    
    return NextResponse.json({
      success: true,
      message: 'Token cache cleared successfully'
    });
    
  } catch (error) {
    console.error('❌ Token cache clear failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Token cache clear failed'
    }, { status: 500 });
  }
}
