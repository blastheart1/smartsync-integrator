export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  sourceType: string;
  targetType: string;
  targetEntity: string;
  fieldMappings: Array<{
    sheetColumn: string;
    targetField: string;
    required: boolean;
    dataType: string;
  }>;
  syncFrequency: string;
  triggerType: string;
  setupInstructions: string[];
  sampleData: any[];
}

export const integrationTemplates: IntegrationTemplate[] = [
  {
    id: "quickbooks-invoices-export",
    name: "Export QuickBooks Invoices to Google Sheets",
    description: "Automatically export your QuickBooks invoices to a Google Sheet for reporting and analysis",
    category: "Accounting",
    icon: "/quickbooks.png",
    sourceType: "quickbooks",
    targetType: "googlesheets",
    targetEntity: "Invoice",
    fieldMappings: [
      { sheetColumn: "Invoice Number", targetField: "Invoice Number", required: true, dataType: "string" },
      { sheetColumn: "Customer Name", targetField: "Customer Name", required: true, dataType: "string" },
      { sheetColumn: "Amount", targetField: "Amount", required: true, dataType: "number" },
      { sheetColumn: "Date", targetField: "Date", required: true, dataType: "date" },
      { sheetColumn: "Status", targetField: "Status", required: false, dataType: "string" },
      { sheetColumn: "Due Date", targetField: "Due Date", required: false, dataType: "date" }
    ],
    syncFrequency: "daily",
    triggerType: "schedule",
    setupInstructions: [
      "Connect your QuickBooks Online account",
      "Select the Google Sheet where you want invoices to be exported",
      "Choose which invoice fields to include in the export",
      "Set the sync frequency (daily, weekly, or monthly)",
      "The integration will automatically create the sheet with proper headers"
    ],
    sampleData: [
      ["INV-001", "Acme Corp", 1250.00, "2024-01-15", "Paid", "2024-02-15"],
      ["INV-002", "Tech Solutions", 875.50, "2024-01-16", "Pending", "2024-02-16"],
      ["INV-003", "Global Industries", 2100.00, "2024-01-17", "Overdue", "2024-01-17"]
    ]
  },

  {
    id: "hubspot-contacts-import",
    name: "Import Contacts from Google Sheets to HubSpot",
    description: "Bulk import contacts from your Google Sheet into HubSpot CRM with automatic field mapping",
    category: "CRM",
    icon: "/hubspot.png",
    sourceType: "googlesheets",
    targetType: "hubspot",
    targetEntity: "Contact",
    fieldMappings: [
      { sheetColumn: "Email", targetField: "ACCOUNT_EMAIL", required: true, dataType: "email" },
      { sheetColumn: "First Name", targetField: "FIRST_NAME", required: true, dataType: "string" },
      { sheetColumn: "Last Name", targetField: "LAST_NAME", required: true, dataType: "string" },
      { sheetColumn: "Company", targetField: "COMPANY", required: false, dataType: "string" },
      { sheetColumn: "Phone", targetField: "PHONE_NUMBER", required: false, dataType: "phone" },
      { sheetColumn: "Lead Status", targetField: "LEAD_STATUS", required: false, dataType: "string" }
    ],
    syncFrequency: "manual",
    triggerType: "new_row",
    setupInstructions: [
      "Connect your HubSpot account",
      "Prepare your Google Sheet with contact data",
      "Ensure the first row contains column headers",
      "Map your sheet columns to HubSpot contact properties",
      "Test the import with a few contacts first",
      "Run the full import when ready"
    ],
    sampleData: [
      ["john@example.com", "John", "Doe", "Acme Corp", "+1-555-0123", "New"],
      ["jane@example.com", "Jane", "Smith", "Tech Solutions", "+1-555-0456", "Qualified"],
      ["bob@example.com", "Bob", "Johnson", "Global Industries", "+1-555-0789", "Contacted"]
    ]
  },

  {
    id: "salesforce-opportunities-export",
    name: "Export Salesforce Opportunities to Google Sheets",
    description: "Export your Salesforce opportunities to Google Sheets for pipeline analysis and reporting",
    category: "CRM",
    icon: "/salesforce.png",
    sourceType: "salesforce",
    targetType: "googlesheets",
    targetEntity: "Opportunity",
    fieldMappings: [
      { sheetColumn: "Opportunity Name", targetField: "Name", required: true, dataType: "string" },
      { sheetColumn: "Account", targetField: "Account.Name", required: true, dataType: "string" },
      { sheetColumn: "Amount", targetField: "Amount", required: true, dataType: "currency" },
      { sheetColumn: "Stage", targetField: "StageName", required: true, dataType: "string" },
      { sheetColumn: "Close Date", targetField: "CloseDate", required: true, dataType: "date" },
      { sheetColumn: "Probability", targetField: "Probability", required: false, dataType: "percentage" }
    ],
    syncFrequency: "weekly",
    triggerType: "schedule",
    setupInstructions: [
      "Connect your Salesforce account",
      "Select the Google Sheet for opportunity data",
      "Choose which opportunity fields to include",
      "Set up weekly sync schedule",
      "The sheet will be automatically updated with latest opportunity data"
    ],
    sampleData: [
      ["Website Redesign", "Acme Corp", 50000, "Proposal/Price Quote", "2024-03-15", 75],
      ["Mobile App Development", "Tech Solutions", 75000, "Negotiation/Review", "2024-04-01", 60],
      ["Cloud Migration", "Global Industries", 120000, "Closed Won", "2024-02-28", 100]
    ]
  },

  {
    id: "sheets-customer-import",
    name: "Import Customers from Google Sheets to QuickBooks",
    description: "Import customer data from your Google Sheet into QuickBooks Online",
    category: "Accounting",
    icon: "/quickbooks.png",
    sourceType: "googlesheets",
    targetType: "quickbooks",
    targetEntity: "Customer",
    fieldMappings: [
      { sheetColumn: "Company Name", targetField: "CompanyName", required: true, dataType: "string" },
      { sheetColumn: "Contact Name", targetField: "GivenName", required: false, dataType: "string" },
      { sheetColumn: "Email", targetField: "PrimaryEmailAddr", required: false, dataType: "email" },
      { sheetColumn: "Phone", targetField: "PrimaryPhone", required: false, dataType: "phone" },
      { sheetColumn: "Address", targetField: "BillAddr.Line1", required: false, dataType: "string" },
      { sheetColumn: "City", targetField: "BillAddr.City", required: false, dataType: "string" },
      { sheetColumn: "State", targetField: "BillAddr.CountrySubDivisionCode", required: false, dataType: "string" },
      { sheetColumn: "ZIP", targetField: "BillAddr.PostalCode", required: false, dataType: "string" }
    ],
    syncFrequency: "manual",
    triggerType: "new_row",
    setupInstructions: [
      "Connect your QuickBooks Online account",
      "Prepare your Google Sheet with customer data",
      "Ensure the first row contains column headers",
      "Map your sheet columns to QuickBooks customer fields",
      "Test the import with a few customers first",
      "Run the full import when ready"
    ],
    sampleData: [
      ["Acme Corp", "John Doe", "john@acme.com", "+1-555-0123", "123 Main St", "New York", "NY", "10001"],
      ["Tech Solutions", "Jane Smith", "jane@tech.com", "+1-555-0456", "456 Oak Ave", "San Francisco", "CA", "94102"],
      ["Global Industries", "Bob Johnson", "bob@global.com", "+1-555-0789", "789 Pine St", "Chicago", "IL", "60601"]
    ]
  }
];

export function getTemplateById(id: string): IntegrationTemplate | undefined {
  return integrationTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): IntegrationTemplate[] {
  return integrationTemplates.filter(template => template.category === category);
}

export function getTemplatesByTargetType(targetType: string): IntegrationTemplate[] {
  return integrationTemplates.filter(template => template.targetType === targetType);
}

export function getAllCategories(): string[] {
  return [...new Set(integrationTemplates.map(template => template.category))];
}
