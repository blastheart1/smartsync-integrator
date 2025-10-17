# Environment Variables Setup Guide

## 🚨 **IMPORTANT: Environment Files Missing!**

Your `.env.local` file is missing, which is why the application isn't working properly.

## 📋 **Required Environment Variables**

You need to create a `.env.local` file in the root directory with these variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# QuickBooks Online Integration
QUICKBOOKS_CLIENT_ID="your_quickbooks_client_id_here"
QUICKBOOKS_CLIENT_SECRET="your_quickbooks_client_secret_here"
QB_COMPANY_ID="your_company_id_here"
QB_ACCESS_TOKEN="your_access_token_here"
QB_REFRESH_TOKEN="your_refresh_token_here"

# Bill.com Integration
BILL_API_KEY="your_bill_api_key_here"
BILL_PASSWORD="your_bill_password_here"
BILL_ORG_ID="your_bill_org_id_here"

# Zapier Integration
ZAPIER_HOOK_URL="your_zapier_webhook_url_here"

# NextAuth Configuration
NEXTAUTH_SECRET="your_nextauth_secret_here"

# Admin Credentials
ADMIN_USER="admin"
ADMIN_PASS="your_admin_password_here"

# Development Settings
NODE_ENV="development"
```

## 🔧 **Quick Setup Steps**

### 1. Create the Environment File
```bash
# In your project root directory, create .env.local
touch .env.local
# or
New-Item -Path ".env.local" -ItemType File
```

### 2. Add Your QuickBooks Credentials
You need these from your QuickBooks Developer account:
- `QUICKBOOKS_CLIENT_ID`
- `QUICKBOOKS_CLIENT_SECRET`
- `QB_COMPANY_ID` (your company/realm ID)
- `QB_ACCESS_TOKEN` (current access token)
- `QB_REFRESH_TOKEN` (refresh token)

### 3. Add Bill.com Credentials (Optional)
If you want to use Bill.com integration:
- `BILL_API_KEY`
- `BILL_PASSWORD`
- `BILL_ORG_ID`

### 4. Generate NextAuth Secret
```bash
# Generate a random secret
openssl rand -base64 32
```

### 5. Restart the Server
After creating the file:
```bash
npm run dev
```

## 🔍 **How to Get QuickBooks Credentials**

1. Go to [Intuit Developer](https://developer.intuit.com/)
2. Sign in and create a new app
3. Get your Client ID and Client Secret
4. Use the OAuth playground to get tokens
5. Copy your Company ID from the playground

## ⚠️ **Security Notes**

- Never commit `.env.local` to version control
- Keep your tokens secure
- Refresh tokens when they expire
- Use different credentials for development/production

## 🚀 **Testing the Setup**

Once you've created the file with your credentials:

1. Restart the development server
2. Go to `http://localhost:8886/integrations/quickbooks`
3. Check the browser console for any errors
4. The dashboard should load with real data

## 🆘 **Need Help?**

If you're still having issues:
1. Check the server console for environment variable debug logs
2. Verify all required variables are set
3. Make sure tokens are not expired
4. Check the browser network tab for API errors
