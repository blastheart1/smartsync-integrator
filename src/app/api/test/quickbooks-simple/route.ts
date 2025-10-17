import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 Simple QuickBooks Test - Starting');
  
  try {
    // Test 1: Check environment variables
    const envCheck = {
      QB_COMPANY_ID: process.env.QB_COMPANY_ID ? 'PRESENT' : 'MISSING',
      QB_ACCESS_TOKEN: process.env.QB_ACCESS_TOKEN ? 'PRESENT' : 'MISSING',
      QB_REFRESH_TOKEN: process.env.QB_REFRESH_TOKEN ? 'PRESENT' : 'MISSING',
      QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID ? 'PRESENT' : 'MISSING',
      QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET ? 'PRESENT' : 'MISSING',
    };

    console.log('📋 Environment check:', envCheck);

    // Test 2: Try basic token refresh
    let tokenResult = { success: false, error: 'Not attempted' };
    try {
      const { refreshQuickBooksToken } = await import('@/lib/integrations/quickbooks-token-refresh');
      const tokenInfo = await refreshQuickBooksToken();
      tokenResult = { 
        success: true, 
        accessTokenLength: tokenInfo.accessToken.length,
        expiresAt: new Date(tokenInfo.expiresAt * 1000).toISOString()
      };
      console.log('✅ Token refresh successful');
    } catch (error) {
      tokenResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('❌ Token refresh failed:', error);
    }

    // Test 3: Try simple API call
    let apiResult = { success: false, error: 'Not attempted' };
    try {
      if (tokenResult.success) {
        const accessToken = process.env.QB_ACCESS_TOKEN;
        const companyId = process.env.QB_COMPANY_ID;
        
        if (!accessToken || !companyId) {
          throw new Error('Missing QB_ACCESS_TOKEN or QB_COMPANY_ID');
        }

        const baseUrl = 'https://sandbox-quickbooks.api.intuit.com';
        const url = `${baseUrl}/v3/company/${companyId}/companyinfo/${companyId}`;
        
        console.log('🌐 Making API call to:', url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          apiResult = {
            success: true,
            status: response.status,
            hasCompanyInfo: !!data?.QueryResponse?.CompanyInfo,
            companyName: data?.QueryResponse?.CompanyInfo?.[0]?.CompanyName || 'N/A'
          };
          console.log('✅ API call successful');
        } else {
          const errorText = await response.text();
          apiResult = {
            success: false,
            status: response.status,
            error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`
          };
          console.error('❌ API call failed:', response.status, errorText);
        }
      } else {
        apiResult = { success: false, error: 'Token refresh failed, skipping API test' };
      }
    } catch (error) {
      apiResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('❌ API test failed:', error);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tokenResult,
      apiResult,
      message: 'Simple QuickBooks test completed'
    });

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
