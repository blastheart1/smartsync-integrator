import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  console.log('🔍 Vercel Environment Debug - Starting check');
  
  try {
    // Check environment variables (mask sensitive data)
    const envCheck = {
      // QuickBooks Environment Variables
      QB_COMPANY_ID: env.QB_COMPANY_ID ? `${env.QB_COMPANY_ID.substring(0, 8)}...` : 'MISSING',
      QB_ACCESS_TOKEN: env.QB_ACCESS_TOKEN ? `${env.QB_ACCESS_TOKEN.substring(0, 20)}...` : 'MISSING',
      QB_REFRESH_TOKEN: env.QB_REFRESH_TOKEN ? `${env.QB_REFRESH_TOKEN.substring(0, 20)}...` : 'MISSING',
      QUICKBOOKS_CLIENT_ID: env.QUICKBOOKS_CLIENT_ID ? `${env.QUICKBOOKS_CLIENT_ID.substring(0, 10)}...` : 'MISSING',
      QUICKBOOKS_CLIENT_SECRET: env.QUICKBOOKS_CLIENT_SECRET ? `${env.QUICKBOOKS_CLIENT_SECRET.substring(0, 10)}...` : 'MISSING',
      
      // Bill.com Environment Variables
      BILL_API_KEY: env.BILL_API_KEY ? `${env.BILL_API_KEY.substring(0, 10)}...` : 'MISSING',
      BILL_PASSWORD: env.BILL_PASSWORD ? `${env.BILL_PASSWORD.substring(0, 5)}...` : 'MISSING',
      BILL_ORG_ID: env.BILL_ORG_ID ? `${env.BILL_ORG_ID.substring(0, 10)}...` : 'MISSING',
      
      // Environment Info
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    };

    console.log('📊 Environment check results:', envCheck);

    // Test QuickBooks token refresh
    let tokenTest = { success: false, error: 'Not attempted' };
    try {
      const { getValidAccessToken } = await import('@/lib/integrations/quickbooks-token-storage');
      const token = await getValidAccessToken();
      tokenTest = { 
        success: true, 
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...'
      };
      console.log('✅ Token test successful:', tokenTest);
    } catch (error) {
      tokenTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.error('❌ Token test failed:', error);
    }

    // Test QuickBooks API call
    let apiTest = { success: false, error: 'Not attempted' };
    try {
      const { fetchQuickBooksData } = await import('@/lib/integrations/quickbooks');
      const result = await fetchQuickBooksData('companyinfo/9341455533530764');
      apiTest = { 
        success: true, 
        hasCompanyInfo: !!result?.QueryResponse?.CompanyInfo,
        companyName: result?.QueryResponse?.CompanyInfo?.[0]?.CompanyName || 'N/A'
      };
      console.log('✅ API test successful:', apiTest);
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
      tokenTest,
      apiTest,
      message: 'Vercel environment debug completed'
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
