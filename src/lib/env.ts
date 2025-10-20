// Environment configuration for integrations
// Use lazy loading to avoid build-time environment variable access issues
export const env = {
  get DATABASE_URL() { return process.env.DATABASE_URL || ""; },
  get QUICKBOOKS_CLIENT_ID() { return process.env.QUICKBOOKS_CLIENT_ID || ""; },
  get QUICKBOOKS_CLIENT_SECRET() { return process.env.QUICKBOOKS_CLIENT_SECRET || ""; },
  get QB_COMPANY_ID() { return process.env.QB_COMPANY_ID || ""; },
  get QB_ACCESS_TOKEN() { return process.env.QB_ACCESS_TOKEN || ""; },
  get QB_REFRESH_TOKEN() { return process.env.QB_REFRESH_TOKEN || ""; },
  get BILL_API_KEY() { return process.env.BILL_API_KEY || ""; },
  get BILL_PASSWORD() { return process.env.BILL_PASSWORD || ""; },
  get BILL_ORG_ID() { return process.env.BILL_ORG_ID || ""; },
  get ZAPIER_HOOK_URL() { return process.env.ZAPIER_HOOK_URL || ""; },
  get NEXTAUTH_SECRET() { return process.env.NEXTAUTH_SECRET || ""; },
  get ADMIN_USER() { return process.env.ADMIN_USER || ""; },
  get ADMIN_PASS() { return process.env.ADMIN_PASS || ""; },
  get GOOGLE_CLIENT_ID() { return process.env.GOOGLE_CLIENT_ID || ""; },
  get GOOGLE_CLIENT_SECRET() { return process.env.GOOGLE_CLIENT_SECRET || ""; },
  get GOOGLE_REDIRECT_URI() { return process.env.GOOGLE_REDIRECT_URI || ""; },
};

// Debug environment variables on server startup (disabled during build)
// Temporarily disabled to fix build hanging issue
// if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production' && !process.env.NEXT_PHASE) {
//   console.log('🔧 Environment Variables Debug:');
//   console.log('  - QB_COMPANY_ID:', process.env.QB_COMPANY_ID ? `${process.env.QB_COMPANY_ID.substring(0, 8)}...` : 'MISSING');
//   console.log('  - QB_ACCESS_TOKEN:', process.env.QB_ACCESS_TOKEN ? `${process.env.QB_ACCESS_TOKEN.substring(0, 20)}...` : 'MISSING');
//   console.log('  - QB_REFRESH_TOKEN:', process.env.QB_REFRESH_TOKEN ? `${process.env.QB_REFRESH_TOKEN.substring(0, 20)}...` : 'MISSING');
//   console.log('  - BILL_API_KEY:', process.env.BILL_API_KEY ? `${process.env.BILL_API_KEY.substring(0, 20)}...` : 'MISSING');
//   console.log('  - BILL_PASSWORD:', process.env.BILL_PASSWORD ? `${process.env.BILL_PASSWORD.substring(0, 10)}...` : 'MISSING');
//   console.log('  - BILL_ORG_ID:', process.env.BILL_ORG_ID ? `${process.env.BILL_ORG_ID.substring(0, 10)}...` : 'MISSING');
// }
