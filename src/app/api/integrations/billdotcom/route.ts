import { NextResponse } from "next/server";
import { fetchBillData } from "@/lib/integrations/billdotcom";

export async function GET(request: Request) {
  console.log('🚀 Bill.com API Route - Request received');
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'vendors';
  console.log('📝 Endpoint parameter:', endpoint);
  console.log('🔗 Full request URL:', request.url);
  console.log('🎯 Calling fetchBillData with endpoint:', endpoint);
  
  try {
    const data = await fetchBillData(endpoint);
    console.log('✅ Bill.com API Route - Data received successfully');
    console.log('📊 Data summary:', {
      hasData: !!data,
      dataKeys: Object.keys(data || {}),
      hasDataArray: !!data?.data,
      dataArrayLength: Array.isArray(data?.data) ? data.data.length : 'Not an array'
    });
    return NextResponse.json(data);
  } catch (e) {
    console.error('❌ Bill.com API Route - Error occurred:', e);
    console.error('❌ Error details:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined
    });
    return NextResponse.json({ 
      error: "Bill.com fetch failed",
      message: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
