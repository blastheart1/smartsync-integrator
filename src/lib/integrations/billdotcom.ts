import { env } from "@/lib/env";
import { getValidBillComSession } from "./billcom-auth";

export async function fetchBillData(endpoint: string) {
  console.log('🔍 Bill.com fetchDebug - Starting API call');
  console.log('📋 Endpoint:', endpoint);
  
  // Check environment variables
  console.log('🔑 Environment variables check:');
  console.log('  - BILL_API_KEY:', env.BILL_API_KEY ? `${env.BILL_API_KEY.substring(0, 20)}...` : 'MISSING');
  console.log('  - BILL_PASSWORD:', env.BILL_PASSWORD ? `${env.BILL_PASSWORD.substring(0, 10)}...` : 'MISSING');
  console.log('  - BILL_ORG_ID:', env.BILL_ORG_ID ? `${env.BILL_ORG_ID.substring(0, 10)}...` : 'MISSING');
  
  // Check if we have the required credentials for real API
  if (!env.BILL_API_KEY || !env.BILL_PASSWORD || !env.BILL_ORG_ID) {
    console.log('⚠️ Missing Bill.com credentials, using mock data');
    return getMockBillData(endpoint);
  }
  
  try {
    // Get valid session
    const session = await getValidBillComSession();
    console.log('✅ Got valid Bill.com session');
    
    // Construct the API URL based on Bill.com v3 API structure
    const baseUrl = 'https://api.bill.com/api/v3';
    const apiUrl = `${baseUrl}/${endpoint}.json`;
    
    console.log('🌐 Using real Bill.com API');
    console.log('🌐 Full URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'sessionId': session.sessionId
      }
    });

    console.log('📥 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Bill.com API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: apiUrl
      });
      
      // If session expired, try to refresh and retry once
      if (response.status === 401 || response.status === 403) {
        console.log('🔄 Session may have expired, trying to refresh...');
        try {
          const { forceRefreshBillComSession } = await import('./billcom-auth');
          const newSession = await forceRefreshBillComSession();
          
          console.log('🔄 Retrying request with refreshed session...');
          const retryResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'sessionId': newSession.sessionId
            }
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Bill.com API retry failed: ${retryResponse.status} ${retryResponse.statusText}`);
          }
          
          const retryData = await retryResponse.json();
          console.log('✅ Retry successful with refreshed session');
          return retryData;
        } catch (refreshError) {
          console.error('❌ Session refresh failed:', refreshError);
          throw new Error(`Bill.com session refresh failed: ${refreshError instanceof Error ? refreshError.message : 'Unknown error'}`);
        }
      }
      
      throw new Error(`Bill.com request failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('✅ Request successful, parsing response...');
    console.log('📊 Response data:', data);
    console.log('🔍 Data structure analysis:');
    console.log('  - Has data property:', !!data.data);
    console.log('  - Data keys:', Object.keys(data));
    if (data.data) {
      console.log('  - Data array length:', Array.isArray(data.data) ? data.data.length : 'Not an array');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Real Bill.com API failed, falling back to mock data:', error);
    return getMockBillData(endpoint);
  }
}

function getMockBillData(endpoint: string) {
  console.log('🌐 Using mock Bill.com data for endpoint:', endpoint);
  console.log('📚 Note: Real Bill.com v3 API requires session authentication');
  console.log('📚 API structure: https://api.bill.com/api/v3/ with session-based auth');
  
  // Mock data structure based on Bill.com API responses
  const mockData = {
    vendors: {
      data: [
        { id: '1', name: 'Office Supplies Inc', email: 'orders@officesupplies.com', balance: 1250.00, isActive: true },
        { id: '2', name: 'Tech Solutions LLC', email: 'billing@techsolutions.com', balance: 850.50, isActive: true },
        { id: '3', name: 'Marketing Partners', email: 'invoices@marketingpartners.com', balance: 2100.00, isActive: false },
        { id: '4', name: 'Utilities Co', email: 'billing@utilitiesco.com', balance: 0, isActive: true },
        { id: '5', name: 'Consulting Services', email: 'admin@consultingservices.com', balance: 750.25, isActive: true }
      ],
      Response_Meta: {
        Total_Count: 5,
        Page_Size: 100,
        Page_Number: 1
      }
    },
    bills: {
      data: [
        { id: '1', invoiceNumber: 'INV-001', vendor: { name: 'Office Supplies Inc' }, amount: 1250.00, dueDate: '2025-11-15', status: 'Pending', category: 'Office Supplies' },
        { id: '2', invoiceNumber: 'INV-002', vendor: { name: 'Tech Solutions LLC' }, amount: 850.50, dueDate: '2025-11-20', status: 'Approved', category: 'Technology' },
        { id: '3', invoiceNumber: 'INV-003', vendor: { name: 'Marketing Partners' }, amount: 2100.00, dueDate: '2025-11-25', status: 'Pending', category: 'Marketing' },
        { id: '4', invoiceNumber: 'INV-004', vendor: { name: 'Utilities Co' }, amount: 450.00, dueDate: '2025-12-01', status: 'Approved', category: 'Utilities' },
        { id: '5', invoiceNumber: 'INV-005', vendor: { name: 'Consulting Services' }, amount: 750.25, dueDate: '2025-12-05', status: 'Pending', category: 'Professional Services' }
      ],
      Response_Meta: {
        Total_Count: 5,
        Page_Size: 100,
        Page_Number: 1
      }
    },
    payments: {
      data: [
        { id: '1', referenceNumber: 'PAY-001', vendor: { name: 'Office Supplies Inc' }, amount: 1250.00, paymentDate: '2025-10-15', paymentMethod: 'ACH', status: 'Completed' },
        { id: '2', referenceNumber: 'PAY-002', vendor: { name: 'Tech Solutions LLC' }, amount: 850.50, paymentDate: '2025-10-18', paymentMethod: 'Check', status: 'Completed' },
        { id: '3', referenceNumber: 'PAY-003', vendor: { name: 'Marketing Partners' }, amount: 2100.00, paymentDate: '2025-10-20', paymentMethod: 'Wire Transfer', status: 'Processing' },
        { id: '4', referenceNumber: 'PAY-004', vendor: { name: 'Utilities Co' }, amount: 450.00, paymentDate: '2025-10-22', paymentMethod: 'ACH', status: 'Completed' },
        { id: '5', referenceNumber: 'PAY-005', vendor: { name: 'Consulting Services' }, amount: 750.25, paymentDate: '2025-10-25', paymentMethod: 'Check', status: 'Completed' }
      ],
      Response_Meta: {
        Total_Count: 5,
        Page_Size: 100,
        Page_Number: 1
      }
    }
  };
  
  console.log('✅ Mock data generated for endpoint:', endpoint);
  console.log('📊 Mock data summary:', {
    hasData: !!mockData[endpoint as keyof typeof mockData],
    dataKeys: mockData[endpoint as keyof typeof mockData] ? Object.keys(mockData[endpoint as keyof typeof mockData]) : [],
    dataArrayLength: mockData[endpoint as keyof typeof mockData]?.data ? mockData[endpoint as keyof typeof mockData].data.length : 0
  });
  
  return mockData[endpoint as keyof typeof mockData] || { data: [], Response_Meta: { Total_Count: 0, Page_Size: 100, Page_Number: 1 } };
}
