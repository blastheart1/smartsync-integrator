import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Token Status Debug - Starting check');
  
  try {
    // Check environment variables
    const envCheck = {
      QB_COMPANY_ID: process.env.QB_COMPANY_ID ? 'PRESENT' : 'MISSING',
      QB_ACCESS_TOKEN: process.env.QB_ACCESS_TOKEN ? 'PRESENT' : 'MISSING',
      QB_REFRESH_TOKEN: process.env.QB_REFRESH_TOKEN ? 'PRESENT' : 'MISSING',
      QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID ? 'PRESENT' : 'MISSING',
      QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET ? 'PRESENT' : 'MISSING',
    };

    // Get token info
    const tokenInfo = {
      accessTokenLength: process.env.QB_ACCESS_TOKEN?.length || 0,
      refreshTokenLength: process.env.QB_REFRESH_TOKEN?.length || 0,
      companyId: process.env.QB_COMPANY_ID || 'MISSING',
      accessTokenPrefix: process.env.QB_ACCESS_TOKEN?.substring(0, 20) + '...' || 'MISSING',
      refreshTokenPrefix: process.env.QB_REFRESH_TOKEN?.substring(0, 20) + '...' || 'MISSING',
    };

    // Test basic API call
    let apiTest = { success: false, error: 'Not attempted' };
    try {
      if (process.env.QB_ACCESS_TOKEN && process.env.QB_COMPANY_ID) {
        const baseUrl = 'https://sandbox-quickbooks.api.intuit.com';
        const url = `${baseUrl}/v3/company/${process.env.QB_COMPANY_ID}/companyinfo/${process.env.QB_COMPANY_ID}`;
        
        console.log('🌐 Testing API call to:', url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.QB_ACCESS_TOKEN}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          apiTest = {
            success: true,
            status: response.status,
            hasCompanyInfo: !!data?.QueryResponse?.CompanyInfo,
            companyName: data?.QueryResponse?.CompanyInfo?.[0]?.CompanyName || 'N/A'
          };
          console.log('✅ API test successful');
        } else {
          const errorText = await response.text();
          apiTest = {
            success: false,
            status: response.status,
            error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`
          };
          console.error('❌ API test failed:', response.status, errorText);
        }
      } else {
        apiTest = { success: false, error: 'Missing QB_ACCESS_TOKEN or QB_COMPANY_ID' };
      }
    } catch (error) {
      apiTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('❌ API test failed:', error);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tokenInfo,
      apiTest,
      message: 'Token status debug completed'
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
