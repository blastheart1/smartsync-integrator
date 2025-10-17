import { NextResponse } from "next/server";
import { fetchQuickBooksData } from "@/lib/integrations/quickbooks";

export async function GET(request: Request) {
  console.log('🚀 QuickBooks API Route - Request received');
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'select * from Customer';
    
    console.log('📝 Query parameter:', query);
    console.log('🔗 Full request URL:', request.url);
    
    const endpoint = `query?query=${encodeURIComponent(query)}`;
    console.log('🎯 Final endpoint:', endpoint);
    
    console.log('📞 Calling fetchQuickBooksData...');
    const data = await fetchQuickBooksData(endpoint);
    
    console.log('✅ API Route - Data received successfully');
    console.log('📊 Data summary:', {
      hasData: !!data,
      hasQueryResponse: !!data?.QueryResponse,
      dataKeys: data ? Object.keys(data) : [],
      queryResponseKeys: data?.QueryResponse ? Object.keys(data.QueryResponse) : []
    });
    
    return NextResponse.json(data);
  } catch (e) {
    console.error('❌ QuickBooks API Route - Error occurred:', e);
    console.error('🔍 Error details:', {
      name: e instanceof Error ? e.name : 'Unknown',
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    });
    return NextResponse.json({ 
      error: "QuickBooks fetch failed",
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}
