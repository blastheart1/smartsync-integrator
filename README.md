# 🚀 SmartSync Integrator

A modern, enterprise-grade integration platform that seamlessly connects QuickBooks Online and Bill.com with advanced data synchronization, automatic token management, and professional UI/UX.

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔄 **Advanced Data Synchronization**
- **Real-time Data Sync**: Live synchronization between QuickBooks Online and Bill.com
- **Automatic Token Refresh**: Smart token management with automatic renewal
- **Error Recovery**: Robust error handling with automatic retry mechanisms
- **Data Validation**: Comprehensive data validation and error reporting

### 📊 **Professional Data Management**
- **Advanced Data Tables**: Search, sort, filter, and export functionality
- **Loading States**: Professional loading skeletons and progress indicators
- **Toast Notifications**: Real-time success/error feedback system
- **Responsive Design**: Mobile-first design that works on all devices

### 🔒 **Enterprise Security**
- **OAuth 2.0 Integration**: Secure authentication with QuickBooks Online
- **Token Encryption**: Secure token storage and management
- **Environment Variables**: All sensitive data stored in environment variables
- **CORS Protection**: Configured cross-origin resource sharing

### 🎨 **Modern UI/UX**
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful, consistent iconography
- **Dark/Light Theme**: Adaptive theming support

## 🏗️ Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth.js authentication
│   │   └── integrations/         # Integration endpoints
│   ├── integrations/             # Integration pages
│   │   ├── quickbooks/           # QuickBooks integration
│   │   └── billcom/              # Bill.com integration
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   └── ui/                       # UI component library
├── lib/                          # Utility libraries
│   ├── integrations/             # Integration logic
│   └── env.ts                    # Environment configuration
└── middleware.ts                 # Next.js middleware
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn**
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
   
   # Admin
   ADMIN_USER="admin"
   ADMIN_PASS="your_password"
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### QuickBooks Online Setup

1. **Create QuickBooks App**
   - Visit [Intuit Developer](https://developer.intuit.com/)
   - Create a new app
   - Configure OAuth 2.0 settings
   - Set redirect URI: `http://localhost:3000/api/auth/callback/quickbooks`

2. **Get Credentials**
   - Copy Client ID and Client Secret
   - Generate access and refresh tokens
   - Note your Company ID (Realm ID)

### Bill.com Setup

1. **Create Bill.com Account**
   - Visit [Bill.com Developer Portal](https://developer.bill.com/)
   - Create developer account
   - Generate API key

2. **Configure API Access**
   - Enable API access in your Bill.com account
   - Copy your API key
   - Configure webhook endpoints (optional)

## 📖 API Documentation

### Authentication Endpoints

#### `POST /api/auth/signin`
Authenticate with the system.

#### `POST /api/auth/signout`
Sign out from the system.

### Integration Endpoints

#### `GET /api/integrations/quickbooks`
Fetch QuickBooks data with automatic token refresh.

**Query Parameters:**
- `query`: SQL query string (e.g., `select * from Customer`)

**Response:**
```json
{
  "QueryResponse": {
    "Customer": [...],
    "startPosition": 1,
    "maxResults": 29
  },
  "time": "2025-10-17T05:24:52.604-07:00"
}
```

#### `GET /api/integrations/billdotcom`
Fetch Bill.com data.

**Query Parameters:**
- `endpoint`: API endpoint (vendors, bills, payments)

#### `GET /api/integrations/quickbooks/refresh-token`
Check token status and manage refresh tokens.

**Methods:**
- `GET`: Check current token status
- `POST`: Force token refresh
- `DELETE`: Clear token cache

## 🎯 Usage Examples

### QuickBooks Integration

```typescript
// Fetch customers
const response = await fetch('/api/integrations/quickbooks?query=select * from Customer');
const data = await response.json();

// Fetch invoices
const invoices = await fetch('/api/integrations/quickbooks?query=select * from Invoice');

// Fetch payments
const payments = await fetch('/api/integrations/quickbooks?query=select * from Payment');
```

### Bill.com Integration

```typescript
// Fetch vendors
const vendors = await fetch('/api/integrations/billdotcom?endpoint=vendors');

// Fetch bills
const bills = await fetch('/api/integrations/billdotcom?endpoint=bills');

// Fetch payments
const payments = await fetch('/api/integrations/billdotcom?endpoint=payments');
```

## 🔒 Security Features

### Token Management
- **Automatic Refresh**: Tokens are automatically refreshed when they expire
- **Secure Storage**: Tokens are stored securely in memory with expiration tracking
- **Error Recovery**: Automatic retry with refreshed tokens on authentication failures

### Data Protection
- **Environment Variables**: All sensitive data stored in environment variables
- **No Hardcoded Secrets**: Comprehensive security audit ensures no hardcoded credentials
- **CORS Configuration**: Proper cross-origin resource sharing setup

### Authentication
- **OAuth 2.0**: Industry-standard authentication with QuickBooks Online
- **NextAuth.js**: Secure session management
- **Admin Authentication**: Protected admin routes

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

## 📦 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure `NEXTAUTH_URL` points to your domain

### Docker

1. **Build Image**
   ```bash
   docker build -t smartsync-integrator .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local smartsync-integrator
   ```

### Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
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
- **Testing**: Write tests for new features
- **Documentation**: Update README for new features

## 📋 Roadmap

### Phase 1 (Current)
- ✅ QuickBooks Online integration
- ✅ Bill.com integration
- ✅ Automatic token refresh
- ✅ Professional UI/UX
- ✅ Data export functionality

### Phase 2 (Planned)
- 🔄 Real-time WebSocket connections
- 📊 Advanced data visualization
- 🔍 Enhanced search and filtering
- 📱 Mobile application
- 🔐 Multi-tenant support

### Phase 3 (Future)
- 🤖 AI-powered insights
- 📈 Business intelligence dashboard
- 🔗 Additional integrations (Xero, Sage, etc.)
- 🌐 Multi-language support
- 📊 Advanced analytics

## 🐛 Troubleshooting

### Common Issues

#### Token Refresh Failures
```bash
# Check environment variables
npm run env:check

# Clear token cache
curl -X DELETE http://localhost:3000/api/integrations/quickbooks/refresh-token
```

#### Database Connection Issues
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
npm run db:test
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

- **QuickBooks Online API** - For providing robust integration capabilities
- **Bill.com API** - For comprehensive financial data access
- **Next.js Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations

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

*SmartSync Integrator - Streamlining your financial data integration workflow*