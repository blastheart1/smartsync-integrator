import { env } from "@/lib/env";

interface BillComSession {
  sessionId: string;
  expiresAt: number;
  organizationId: string;
  userId: string;
}

interface LoginResponse {
  sessionId: string;
  userId: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

// In-memory session storage (in production, use a database or secure storage)
let sessionCache: BillComSession | null = null;

/**
 * Get valid Bill.com session, creating new session if needed
 */
export async function getValidBillComSession(): Promise<BillComSession> {
  console.log('🔍 Getting valid Bill.com session...');

  // Check if we have a cached session
  if (sessionCache && sessionCache.expiresAt > Date.now() + 60 * 1000) { // Refresh if less than 1 minute left
    console.log('✅ Using cached session. Expires in:', Math.round((sessionCache.expiresAt - Date.now()) / 1000 / 60), 'minutes');
    return sessionCache;
  }

  // If no session or expired, create new session
  console.log('🔄 Creating new Bill.com session...');
  try {
    const newSession = await createBillComSession();
    sessionCache = newSession;
    console.log('✅ New session created and cached. Expires in:', Math.round((newSession.expiresAt - Date.now()) / 1000 / 60), 'minutes');
    return newSession;
  } catch (error) {
    console.error('❌ Failed to create Bill.com session:', error);
    throw new Error('Failed to authenticate with Bill.com');
  }
}

/**
 * Create new Bill.com session
 */
async function createBillComSession(): Promise<BillComSession> {
  console.log('🚀 Creating Bill.com session...');
  
  if (!env.BILL_API_KEY) {
    throw new Error('BILL_API_KEY not found in environment variables');
  }

  // For Bill.com v3 API, we need to use the login endpoint
  // Based on official docs: https://developer.bill.com/docs/home
  // Try different possible endpoints for Bill.com authentication
  const loginUrl = 'https://api.bill.com/api/v3/Login.json';
  
  console.log('🔍 Attempting Bill.com authentication with multiple endpoint formats...');
  
  console.log('📤 Making login request to:', loginUrl);
  console.log('🔑 Login credentials check:');
  console.log('  - userName:', env.BILL_API_KEY ? `${env.BILL_API_KEY.substring(0, 10)}...` : 'MISSING');
  console.log('  - password:', env.BILL_PASSWORD ? `${env.BILL_PASSWORD.substring(0, 5)}...` : 'MISSING');
  console.log('  - orgId:', env.BILL_ORG_ID ? `${env.BILL_ORG_ID.substring(0, 10)}...` : 'MISSING');
  
  const loginData = {
    userName: env.BILL_API_KEY,
    password: env.BILL_PASSWORD || '',
    orgId: env.BILL_ORG_ID || ''
  };
  
  console.log('📤 Login request body:', {
    userName: loginData.userName ? `${loginData.userName.substring(0, 10)}...` : 'MISSING',
    password: loginData.password ? `${loginData.password.substring(0, 5)}...` : 'MISSING',
    orgId: loginData.orgId ? `${loginData.orgId.substring(0, 10)}...` : 'MISSING'
  });
  
  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(loginData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Bill.com login failed:', {
      status: response.status,
      statusText: response.statusText,
      url: loginUrl,
      errorData: errorData,
      responseText: await response.text().catch(() => 'Could not read response text')
    });
    throw new Error(`Bill.com login failed: ${response.status} ${response.statusText} - ${errorData.message || errorData.error || 'Unknown error'}`);
  }

  const data: LoginResponse = await response.json();
  console.log('✅ Bill.com login successful');
  console.log('📊 Session info:', {
    sessionId: data.sessionId.substring(0, 20) + '...',
    userId: data.userId,
    organizationId: data.organizationId,
    email: data.email
  });

  // Bill.com sessions expire after 35 minutes of inactivity
  const expiresAt = Date.now() + (35 * 60 * 1000); // 35 minutes from now

  return {
    sessionId: data.sessionId,
    expiresAt,
    organizationId: data.organizationId,
    userId: data.userId
  };
}

/**
 * Clear cached session (useful for testing or manual refresh)
 */
export function clearBillComSession(): void {
  console.log('🗑️ Clearing Bill.com session cache');
  sessionCache = null;
}

/**
 * Get session cache info for debugging
 */
export function getBillComSessionInfo(): {
  hasSession: boolean;
  sessionInfo?: {
    expiresIn: number;
    expiresInMinutes: number;
    expiresAtDate: string;
    isExpired: boolean;
    organizationId: string;
    userId: string;
  }
} {
  if (!sessionCache) {
    return { hasSession: false };
  }

  const expiresIn = sessionCache.expiresAt - Date.now();
  const expiresInMinutes = Math.round(expiresIn / 1000 / 60);
  const isExpired = sessionCache.expiresAt <= Date.now();

  return {
    hasSession: true,
    sessionInfo: {
      expiresIn,
      expiresInMinutes,
      expiresAtDate: new Date(sessionCache.expiresAt).toISOString(),
      isExpired,
      organizationId: sessionCache.organizationId,
      userId: sessionCache.userId
    }
  };
}

/**
 * Force refresh session (useful for manual refresh)
 */
export async function forceRefreshBillComSession(): Promise<BillComSession> {
  console.log('🔄 Force refreshing Bill.com session...');
  clearBillComSession();
  return await getValidBillComSession();
}
