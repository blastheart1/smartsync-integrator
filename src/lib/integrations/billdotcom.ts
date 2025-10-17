import { env } from "@/lib/env";

export async function fetchBillData(endpoint: string) {
  // Bill.com v3 API uses different base URLs for different environments
  const baseUrl = env.BILL_API_KEY.includes('sandbox') || env.BILL_API_KEY.includes('test') 
    ? 'https://api-stage.bill.com' 
    : 'https://api.bill.com';
  
  const res = await fetch(`${baseUrl}/v3/${endpoint}`, {
    headers: { 
      Authorization: `Bearer ${env.BILL_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Bill.com request failed: ${res.status} ${res.statusText} - ${errorData.message || 'Unknown error'}`);
  }
  return res.json();
}
