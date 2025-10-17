import { env } from "@/lib/env";
import { getValidAccessToken, handle401Error } from "./quickbooks-token-storage";

export async function fetchQuickBooksData(endpoint: string) {
  console.log('🔍 QuickBooks fetchDebug - Starting API call');
  console.log('📋 Endpoint:', endpoint);
  console.log('🔑 Environment variables check:');
  console.log('  - QB_COMPANY_ID:', env.QB_COMPANY_ID ? `${env.QB_COMPANY_ID.substring(0, 8)}...` : 'MISSING');
  console.log('  - QB_ACCESS_TOKEN:', env.QB_ACCESS_TOKEN ? `${env.QB_ACCESS_TOKEN.substring(0, 20)}...` : 'MISSING');
  
  // Get valid access token (will refresh if needed)
  const accessToken = await getValidAccessToken();
  
  // QuickBooks API uses different base URLs for sandbox vs production
  // Using sandbox URL for testing with sandbox company
  const baseUrl = 'https://sandbox-quickbooks.api.intuit.com';
  
  console.log('🌐 Using base URL:', baseUrl);
  const fullUrl = `${baseUrl}/v3/company/${env.QB_COMPANY_ID}/${endpoint}`;
  console.log('🌐 Full URL:', fullUrl);
  
  console.log('📤 Making request with headers:');
  console.log('  - Authorization:', `Bearer ${accessToken.substring(0, 20)}...`);
  console.log('  - Accept: application/json');
  console.log('  - Content-Type: application/json');
  
  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      'Content-Type': 'application/json'
    },
  });
  
  console.log('📥 Response received:');
  console.log('  - Status:', res.status);
  console.log('  - Status Text:', res.statusText);
  console.log('  - Headers:', Object.fromEntries(res.headers.entries()));
  
  if (!res.ok) {
    console.log('❌ Request failed, parsing error response...');
    const errorData = await res.json().catch(() => ({}));
    console.log('🚨 Error data:', errorData);
    
    // If we get 401 Unauthorized, try to refresh token and retry once
    if (res.status === 401) {
      console.log('🔄 Got 401 Unauthorized, attempting token refresh...');
      try {
        // Use the handle401Error function for cleaner retry logic
        const retryFunction = async () => {
          const newAccessToken = await getValidAccessToken();
          
          console.log('🔄 Retrying request with refreshed token...');
          const retryRes = await fetch(fullUrl, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
              Accept: "application/json",
              'Content-Type': 'application/json'
            },
          });
          
          if (retryRes.ok) {
            console.log('✅ Retry successful with refreshed token');
            const data = await retryRes.json();
            console.log('📊 Response data:', data);
            console.log('🔍 Data structure analysis:');
            console.log('  - Has QueryResponse:', !!data.QueryResponse);
            console.log('  - QueryResponse keys:', data.QueryResponse ? Object.keys(data.QueryResponse) : 'N/A');
            return data;
          } else {
            console.log('❌ Retry failed:', retryRes.status, retryRes.statusText);
            const retryErrorData = await retryRes.json().catch(() => ({}));
            throw new Error(`QuickBooks retry failed: ${retryRes.status} ${retryRes.statusText} - ${retryErrorData.Fault?.Error?.[0]?.Detail || 'Unknown error'}`);
          }
        };
        
        return await handle401Error(retryFunction);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        throw refreshError;
      }
    }
    
    throw new Error(`QuickBooks request failed: ${res.status} ${res.statusText} - ${errorData.Fault?.Error?.[0]?.Detail || 'Unknown error'}`);
  }
  
  console.log('✅ Request successful, parsing response...');
  const data = await res.json();
  console.log('📊 Response data:', data);
  console.log('🔍 Data structure analysis:');
  console.log('  - Has QueryResponse:', !!data.QueryResponse);
  console.log('  - QueryResponse keys:', data.QueryResponse ? Object.keys(data.QueryResponse) : 'N/A');
  
  return data;
}
