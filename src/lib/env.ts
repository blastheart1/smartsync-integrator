// Environment configuration for integrations
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID || "",
  QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET || "",
  QB_COMPANY_ID: process.env.QB_COMPANY_ID || "",
  QB_ACCESS_TOKEN: process.env.QB_ACCESS_TOKEN || "",
  QB_REFRESH_TOKEN: process.env.QB_REFRESH_TOKEN || "",
  BILL_API_KEY: process.env.BILL_API_KEY || "",
  BILL_PASSWORD: process.env.BILL_PASSWORD || "",
  BILL_ORG_ID: process.env.BILL_ORG_ID || "",
  ZAPIER_HOOK_URL: process.env.ZAPIER_HOOK_URL || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  ADMIN_USER: process.env.ADMIN_USER || "",
  ADMIN_PASS: process.env.ADMIN_PASS || "",
};

// Debug environment variables on server startup
if (typeof window === 'undefined') {
  console.log('🔧 Environment Variables Debug:');
  console.log('  - QB_COMPANY_ID:', process.env.QB_COMPANY_ID ? `${process.env.QB_COMPANY_ID.substring(0, 8)}...` : 'MISSING');
  console.log('  - QB_ACCESS_TOKEN:', process.env.QB_ACCESS_TOKEN ? `${process.env.QB_ACCESS_TOKEN.substring(0, 20)}...` : 'MISSING');
  console.log('  - QB_REFRESH_TOKEN:', process.env.QB_REFRESH_TOKEN ? `${process.env.QB_REFRESH_TOKEN.substring(0, 20)}...` : 'MISSING');
  console.log('  - BILL_API_KEY:', process.env.BILL_API_KEY ? `${process.env.BILL_API_KEY.substring(0, 20)}...` : 'MISSING');
  console.log('  - BILL_PASSWORD:', process.env.BILL_PASSWORD ? `${process.env.BILL_PASSWORD.substring(0, 10)}...` : 'MISSING');
  console.log('  - BILL_ORG_ID:', process.env.BILL_ORG_ID ? `${process.env.BILL_ORG_ID.substring(0, 10)}...` : 'MISSING');
}
