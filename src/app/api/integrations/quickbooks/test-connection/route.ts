import { NextResponse } from 'next/server';
import { fetchQuickBooksData } from '@/lib/integrations/quickbooks';

export async function GET() {
  console.log('🧪 QuickBooks test connection requested');
  
  try {
    // Test the connection by making a simple API call
    const result = await fetchQuickBooksData('select * from CompanyInfo maxresults 1');
    
    if (result.success && result.data) {
      const companyInfo = Array.isArray(result.data) ? result.data[0] : result.data;
      console.log('✅ QuickBooks test connection successful');
      
      return NextResponse.json({
        success: true,
        message: 'QuickBooks connection test successful',
        data: {
          companyId: companyInfo.Id || 'N/A',
          companyName: companyInfo.CompanyName || 'N/A',
          apiVersion: companyInfo.MetaData?.LastUpdatedTime || 'N/A',
          connectionStatus: 'Connected'
        }
      });
    } else {
      console.error('❌ QuickBooks test connection failed:', result.error);
      return NextResponse.json({
        success: false,
        message: 'QuickBooks connection test failed',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ QuickBooks test connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'QuickBooks connection test failed',
      error: (error as Error).message
    }, { status: 500 });
  }
}
