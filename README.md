# 🚀 SmartSync Integrator

A modern, enterprise-grade integration platform that seamlessly connects your favorite business tools with advanced data synchronization, automation workflows, and professional UI/UX.

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔄 **Comprehensive Integration Hub**
- **20+ Integrations**: CRM, ERP, Payment gateways, Communication tools, Cloud services, Marketing platforms, Project management
- **Bi-directional Sync**: Seamless data flow between connected applications
- **Automation Workflows**: Visual flow builder for custom integrations
- **Real-time Monitoring**: Live sync status and activity logs

### 📊 **Advanced Data Management**
- **Google Sheets Integration**: Full OAuth, multi-account support, read/write operations
- **Integration Mapper**: Visual field mapping with drag-and-drop interface
- **Template System**: Pre-built integrations for common use cases
- **Sync Engine**: Background job processing with error handling and retry logic

### 🎨 **Modern UI/UX**
- **Component-Based Architecture**: Reusable, maintainable CSS system
- **Bento Grid Layout**: Beautiful, responsive integration cards
- **Accessibility Compliant**: WCAG 2.1 AA standards with proper contrast and keyboard navigation
- **Seamless Scrolling**: Custom scrollbar styling across all components

### 🔒 **Enterprise Security**
- **OAuth 2.0 Integration**: Secure authentication with multiple providers
- **Token Management**: Automatic refresh and secure storage
- **Environment Variables**: All sensitive data stored securely
- **Multi-account Support**: Manage multiple accounts per integration

## 🏗️ Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth.js authentication
│   │   ├── integrations/         # Integration endpoints
│   │   │   ├── quickbooks/       # QuickBooks integration
│   │   │   ├── googlesheets/     # Google Sheets integration
│   │   │   └── billdotcom/       # Bill.com integration
│   │   └── sync/                 # Sync engine endpoints
│   ├── integrations/             # Integration pages
│   │   ├── quickbooks/           # QuickBooks dashboard
│   │   ├── googlesheets/         # Google Sheets dashboard
│   │   │   └── create/           # Integration mapper
│   │   └── [provider]/           # Dynamic provider pages
│   └── globals.css               # Global styles with component classes
├── components/                   # Reusable components
│   ├── integrations/             # Integration-specific components
│   │   ├── BentoGrid.tsx         # Integration grid layout
│   │   ├── IntegrationCard.tsx   # Integration cards
│   │   ├── IntegrationMapper.tsx # Visual integration builder
│   │   ├── GoogleSheetsBrowser.tsx # Spreadsheet browser
│   │   └── SyncMonitoring.tsx    # Sync status monitoring
│   ├── dashboard/                # Dashboard components
│   └── ui/                       # UI component library
├── lib/                          # Utility libraries
│   ├── integrations/             # Integration logic
│   │   ├── registry.ts           # Integration capabilities registry
│   │   ├── googlesheets.ts       # Google Sheets API client
│   │   └── templates.ts          # Pre-built integration templates
│   ├── sync/                     # Sync engine
│   │   ├── engine.ts             # Core sync orchestrator
│   │   └── scheduler.ts          # Background job scheduler
│   └── env.ts                    # Environment configuration
└── middleware.ts                 # Next.js middleware
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn**
- **PostgreSQL** database
- **Google Cloud Console** account (for Google Sheets)
- **QuickBooks Online** developer account
- **Bill.com** developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blastheart1/smartsync-integrator.git
   cd smartsync-integrator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/smartsync_integrator"
   
   # Google Sheets Integration
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/integrations/googlesheets/callback"
   
   # QuickBooks Online
   QUICKBOOKS_CLIENT_ID="your_client_id"
   QUICKBOOKS_CLIENT_SECRET="your_client_secret"
   QB_COMPANY_ID="your_company_id"
   QB_ACCESS_TOKEN="your_access_token"
   QB_REFRESH_TOKEN="your_refresh_token"
   
   # Bill.com
   BILL_API_KEY="your_api_key"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your_secret_key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Google Sheets Setup

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Sheets API and Google Drive API

2. **Configure OAuth 2.0**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Set redirect URI: `http://localhost:3000/api/integrations/googlesheets/callback`
   - Add your email as a test user

3. **Get Credentials**
   - Copy Client ID and Client Secret
   - Add to your `.env.local` file

### QuickBooks Online Setup

1. **Create QuickBooks App**
   - Visit [Intuit Developer](https://developer.intuit.com/)
   - Create a new app
   - Configure OAuth 2.0 settings
   - Set redirect URI: `http://localhost:3000/api/auth/callback/quickbooks`

### Bill.com Setup

1. **Create Bill.com Account**
   - Visit [Bill.com Developer Portal](https://developer.bill.com/)
   - Create developer account
   - Generate API key

## 📖 Integration Registry

### Available Integrations

#### **CRM Systems**
- **HubSpot** - Contact and deal management
- **Salesforce** - Accounts, contacts, and opportunities
- **Zoho Desk** - Ticket and help desk management

#### **ERP Systems**
- **QuickBooks Online** - Financial data and invoicing
- **NetSuite** - Enterprise resource planning
- **SAP** - Business process integration

#### **Payment Gateways**
- **Stripe** - Payment processing and subscriptions
- **PayPal** - Online payment solutions

#### **Communication Tools**
- **Slack** - Team messaging and notifications
- **Twilio** - SMS and voice communications
- **Microsoft Teams** - Business communication platform

#### **Cloud Services**
- **Google Sheets** - Spreadsheet data management
- **Google Drive** - File storage and sharing
- **Dropbox** - Cloud file synchronization

#### **Marketing Platforms**
- **Mailchimp** - Email marketing campaigns
- **Klaviyo** - Email and SMS marketing automation

#### **Project Management**
- **Asana** - Task and project organization
- **Trello** - Board-based project management
- **ClickUp** - All-in-one productivity platform

## 🎯 Usage Examples

### Google Sheets Integration

```typescript
// List spreadsheets
const spreadsheets = await fetch('/api/integrations/googlesheets/spreadsheets');

// Read data from range
const data = await fetch('/api/integrations/googlesheets/read', {
  method: 'POST',
  body: JSON.stringify({
    spreadsheetId: 'your_sheet_id',
    range: 'Sheet1!A1:D10'
  })
});

// Create integration mapping
const mapping = await fetch('/api/integrations/googlesheets/mappings', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Customer Sync',
    sourceSpreadsheetId: 'source_id',
    targetSpreadsheetId: 'target_id',
    sourceRange: 'A1:Z',
    targetRange: 'A1:Z',
    fieldMappings: [
      { source: 'Name', target: 'Customer Name' },
      { source: 'Email', target: 'Email Address' }
    ]
  })
});
```

### Integration Templates

```typescript
// Available templates
const templates = [
  {
    id: 'quickbooks-to-sheets',
    name: 'QuickBooks → Google Sheets',
    description: 'Sync customers and invoices to spreadsheet',
    source: 'quickbooks',
    target: 'googlesheets'
  },
  {
    id: 'hubspot-to-sheets',
    name: 'HubSpot → Google Sheets',
    description: 'Export contacts and deals to spreadsheet',
    source: 'hubspot',
    target: 'googlesheets'
  }
];
```

## 🔒 Security Features

### Token Management
- **Automatic Refresh**: Tokens are automatically refreshed when they expire
- **Secure Storage**: Tokens stored in PostgreSQL with encryption
- **Multi-account Support**: Manage multiple accounts per integration
- **Error Recovery**: Automatic retry with refreshed tokens

### Data Protection
- **Environment Variables**: All sensitive data stored securely
- **OAuth 2.0**: Industry-standard authentication
- **Database Encryption**: Secure data storage with Prisma
- **CORS Configuration**: Proper cross-origin resource sharing

## 🎨 Design System

### Component Architecture
- **Reusable Components**: Button, card, badge, modal, tab components
- **Design Tokens**: Centralized colors, spacing, and typography
- **Accessibility**: WCAG 2.1 AA compliant with proper contrast ratios
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### CSS Architecture
- **Zero Inline Styles**: All styling through Tailwind classes and component classes
- **Semantic Classes**: `.btn-primary`, `.card`, `.badge-status` for maintainability
- **Design Tokens**: Brand colors, text colors, and spacing defined in config
- **Component Layer**: Reusable UI patterns in `@layer components`

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Run Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Database Operations
```bash
# Push schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## 📦 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure `NEXTAUTH_URL` points to your domain
   - Set up PostgreSQL database (Vercel Postgres recommended)

3. **Database Setup**
   ```bash
   npx prisma db push
   ```

### Docker

1. **Build Image**
   ```bash
   docker build -t smartsync-integrator .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local smartsync-integrator
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow ESLint and Prettier configurations
- **TypeScript**: Use strict typing
- **Component Classes**: Use the design system components
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Testing**: Write tests for new features
- **Documentation**: Update README for new features

## 📋 Roadmap

### Phase 1 (Completed ✅)
- ✅ Integration registry with 20+ providers
- ✅ Google Sheets full integration with OAuth
- ✅ Integration mapper with visual field mapping
- ✅ Sync engine with background job processing
- ✅ Component-based CSS architecture
- ✅ Accessibility improvements (WCAG 2.1 AA)

### Phase 2 (In Progress 🔄)
- 🔄 HubSpot OAuth and contacts sync
- 🔄 Slack messaging integration
- 🔄 Salesforce SOQL queries
- 🔄 Advanced monitoring dashboard
- 🔄 Webhook support for real-time updates

### Phase 3 (Planned 📋)
- 📋 AI-powered field mapping suggestions
- 📋 Advanced data transformation rules
- 📋 Multi-tenant support
- 📋 Mobile application
- 📋 Additional integrations (Xero, Sage, etc.)

## 🐛 Troubleshooting

### Common Issues

#### Google Sheets OAuth Issues
```bash
# Check Google Cloud Console settings
# Ensure APIs are enabled: Google Sheets API, Google Drive API
# Verify redirect URI matches exactly
# Add your email as a test user in OAuth consent screen
```

#### Database Connection Issues
```bash
# Check database URL
echo $DATABASE_URL

# Reset database
npx prisma db push --force-reset
```

#### Build Failures
```bash
# Clear cache
rm -rf .next
npm run clean

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google APIs** - For comprehensive integration capabilities
- **QuickBooks Online API** - For financial data access
- **Bill.com API** - For payment processing
- **Next.js Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Prisma** - For excellent database tooling

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/blastheart1/smartsync-integrator/wiki)
- **Issues**: [GitHub Issues](https://github.com/blastheart1/smartsync-integrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/blastheart1/smartsync-integrator/discussions)

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [GitHub Wiki](https://github.com/blastheart1/smartsync-integrator/wiki)
- **API Reference**: [API Docs](https://github.com/blastheart1/smartsync-integrator/wiki/API-Reference)

---

**Made with ❤️ by [blastheart1](https://github.com/blastheart1)**

*SmartSync Integrator - Streamlining your business integration workflow*