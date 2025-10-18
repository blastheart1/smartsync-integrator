import { NextResponse } from 'next/server';
import { fetchQuickBooksData } from '@/lib/integrations/quickbooks';
import { getValidAccessToken, getTokenCacheInfo } from '@/lib/integrations/quickbooks-token-storage';
import { env } from '@/lib/env';

export async function GET() {
  console.log('🧪 QuickBooks test connection requested');
  
  try {
    // 1. Check environment variables
    if (!env.QB_COMPANY_ID || !env.QUICKBOOKS_CLIENT_ID || !env.QUICKBOOKS_CLIENT_SECRET || !env.QB_REFRESH_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Missing required QuickBooks environment variables (QB_COMPANY_ID, QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET, QB_REFRESH_TOKEN)',
      }, { status: 400 });
    }

    // 2. Get valid access token (will trigger refresh if needed)
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      throw new Error('Failed to obtain a valid QuickBooks access token.');
    }

    // 3. Test CompanyInfo endpoint
    const companyInfo = await fetchQuickBooksData(`companyinfo/${env.QB_COMPANY_ID}`);
    const companyName = companyInfo?.QueryResponse?.CompanyInfo?.[0]?.CompanyName || 'N/A';
    const companyId = companyInfo?.QueryResponse?.CompanyInfo?.[0]?.Id || 'N/A';

    // 4. Test Customer data retrieval
    const customers = await fetchQuickBooksData('query?query=select * from Customer STARTPOSITION 1 MAXRESULTS 1');
    const customerCount = customers?.QueryResponse?.Customer?.length || 0;

    // 5. Check token cache status
    const tokenCacheStatus = getTokenCacheInfo();

    return NextResponse.json({
      success: true,
      message: 'QuickBooks connection test successful',
      data: {
        companyName,
        companyId,
        customerCount,
        tokenCacheStatus,
      },
    });
  } catch (error) {
    console.error('❌ QuickBooks test connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'QuickBooks connection test failed',
      error: (error as Error).message,
    }, { status: 500 });
  }
}
