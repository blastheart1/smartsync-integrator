import { NextResponse } from "next/server";
import { fetchBillData } from "@/lib/integrations/billdotcom";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'vendors';
    
    const data = await fetchBillData(endpoint);
    return NextResponse.json(data);
  } catch (e) {
    console.error('Bill.com API error:', e);
    return NextResponse.json({ error: "Bill.com fetch failed" }, { status: 500 });
  }
}
