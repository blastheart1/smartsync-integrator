/**
 * Integration Capabilities Registry
 * Single source of truth for all provider capabilities, OAuth types, and flows
 */

export type IntegrationCategory = "CRM" | "ERP" | "Payments" | "Comms" | "Cloud" | "Marketing" | "PM";

export type OAuthType = "oauth2" | "apikey" | "none";

export type IntegrationStatus = "available" | "coming_soon" | "beta";

export type Flow = {
  from: string;
  to: string;
  entities: string[];
  description?: string;
};

export type Capability = {
  entities: string[];       // Data objects this provider supports
  triggers: string[];       // Webhook/event triggers
  actions: string[];        // Operations you can perform
  flows: Flow[];           // Bi-directional flow options
};

export type ProviderConfig = {
  key: string;
  name: string;
  category: IntegrationCategory;
  icon: string;            // Path to icon in /public or lucide icon name
  description: string;
  oauth: OAuthType;
  status: IntegrationStatus;
  capability: Capability;
  docsUrl?: string;
  color?: string;          // Brand color for UI
};

// Integration Registry
export const registry: ProviderConfig[] = [
  // Existing integrations
  {
    key: "quickbooks",
    name: "QuickBooks Online",
    category: "ERP",
    icon: "/quickbooks.png",
    description: "Sync invoices, bills, and payments with QuickBooks Online",
    oauth: "oauth2",
    status: "available",
    color: "#2CA01C",
    docsUrl: "https://developer.intuit.com/app/developer/qbo/docs/develop",
    capability: {
      entities: ["Customer", "Invoice", "Payment", "Bill", "Vendor"],
      triggers: ["New Invoice", "Payment Received", "New Customer"],
      actions: ["Create Invoice", "Record Payment", "Create Customer", "Update Invoice"],
      flows: [
        { from: "quickbooks", to: "googlesheets", entities: ["Invoice", "Customer", "Payment"] },
        { from: "quickbooks", to: "slack", entities: ["Invoice", "Payment"] },
        { from: "googlesheets", to: "quickbooks", entities: ["Customer", "Invoice"] }
      ]
    }
  },
  {
    key: "billcom",
    name: "Bill.com",
    category: "ERP",
    icon: "/billcom.png",
    description: "Automate payable workflows and vendor management",
    oauth: "oauth2",
    status: "beta",
    color: "#00A3E0",
    docsUrl: "https://developer.bill.com/docs/home",
    capability: {
      entities: ["Vendor", "Bill", "Payment", "Invoice"],
      triggers: ["New Bill", "Payment Sent", "Bill Approved"],
      actions: ["Create Bill", "Send Payment", "Create Vendor"],
      flows: [
        { from: "billcom", to: "quickbooks", entities: ["Bill", "Vendor", "Payment"] },
        { from: "billcom", to: "slack", entities: ["Bill", "Payment"] }
      ]
    }
  },
  {
    key: "zapier",
    name: "Zapier",
    category: "Cloud",
    icon: "/zapier.png",
    description: "Connect with 5000+ apps and automate workflows",
    oauth: "apikey",
    status: "available",
    color: "#FF4A00",
    docsUrl: "https://zapier.com/developer",
    capability: {
      entities: ["Zap", "Webhook", "Action"],
      triggers: ["Webhook Received", "Schedule"],
      actions: ["Trigger Zap", "Send Webhook"],
      flows: [
        { from: "zapier", to: "quickbooks", entities: ["Invoice", "Customer"] },
        { from: "quickbooks", to: "zapier", entities: ["Invoice", "Payment"] }
      ]
    }
  },

  // Priority new integrations
  {
    key: "hubspot",
    name: "HubSpot",
    category: "CRM",
    icon: "/hubspot.png",
    description: "Sync contacts, deals, and companies with HubSpot CRM",
    oauth: "oauth2",
    status: "available",
    color: "#FF7A59",
    docsUrl: "https://developers.hubspot.com/docs/api/overview",
    capability: {
      entities: ["Contact", "Company", "Deal", "Ticket", "Task"],
      triggers: ["New Contact", "Deal Updated", "Contact Updated", "Company Created"],
      actions: ["Create Contact", "Update Deal", "Create Company", "Add Note", "Create Task"],
      flows: [
        { from: "hubspot", to: "googlesheets", entities: ["Contact", "Deal", "Company"] },
        { from: "hubspot", to: "slack", entities: ["Deal", "Contact"] },
        { from: "googlesheets", to: "hubspot", entities: ["Contact", "Company"] },
        { from: "quickbooks", to: "hubspot", entities: ["Customer"] }
      ]
    }
  },
  {
    key: "salesforce",
    name: "Salesforce",
    category: "CRM",
    icon: "/salesforce.png",
    description: "Connect with Salesforce CRM for accounts, contacts, and opportunities",
    oauth: "oauth2",
    status: "available",
    color: "#00A1E0",
    docsUrl: "https://developer.salesforce.com/docs",
    capability: {
      entities: ["Account", "Contact", "Opportunity", "Lead", "Case"],
      triggers: ["New Lead", "Opportunity Updated", "Case Created", "Contact Updated"],
      actions: ["Create Lead", "Update Opportunity", "Create Account", "Add Contact", "Update Case"],
      flows: [
        { from: "salesforce", to: "googlesheets", entities: ["Account", "Contact", "Opportunity"] },
        { from: "salesforce", to: "slack", entities: ["Opportunity", "Lead"] },
        { from: "googlesheets", to: "salesforce", entities: ["Lead", "Contact"] },
        { from: "quickbooks", to: "salesforce", entities: ["Customer"] }
      ]
    }
  },
  {
    key: "googlesheets",
    name: "Google Sheets",
    category: "Cloud",
    icon: "/googlesheets.png",
    description: "Read and write data to Google Sheets spreadsheets",
    oauth: "oauth2",
    status: "available",
    color: "#0F9D58",
    docsUrl: "https://developers.google.com/sheets/api",
    capability: {
      entities: ["Spreadsheet", "Row", "Cell", "Sheet"],
      triggers: ["New Row", "Row Updated", "Cell Changed"],
      actions: ["Append Row", "Update Cell", "Create Sheet", "Get Rows", "Delete Row"],
      flows: [
        { from: "googlesheets", to: "quickbooks", entities: ["Customer", "Invoice"] },
        { from: "googlesheets", to: "hubspot", entities: ["Contact", "Company"] },
        { from: "googlesheets", to: "salesforce", entities: ["Lead", "Contact"] },
        { from: "quickbooks", to: "googlesheets", entities: ["Invoice", "Customer", "Payment"] },
        { from: "hubspot", to: "googlesheets", entities: ["Contact", "Deal"] },
        { from: "salesforce", to: "googlesheets", entities: ["Account", "Opportunity"] }
      ]
    }
  },
  {
    key: "slack",
    name: "Slack",
    category: "Comms",
    icon: "/slack.png",
    description: "Send messages and notifications to Slack channels",
    oauth: "oauth2",
    status: "available",
    color: "#4A154B",
    docsUrl: "https://api.slack.com/docs",
    capability: {
      entities: ["Message", "Channel", "User"],
      triggers: ["New Message", "Mention", "Reaction Added"],
      actions: ["Send Message", "Create Channel", "Update Message", "Add Reaction"],
      flows: [
        { from: "slack", to: "hubspot", entities: ["Contact"] },
        { from: "quickbooks", to: "slack", entities: ["Invoice", "Payment"] },
        { from: "hubspot", to: "slack", entities: ["Deal"] },
        { from: "salesforce", to: "slack", entities: ["Opportunity"] }
      ]
    }
  },

  // Additional integrations (Coming Soon / Beta)
  {
    key: "zohodesk",
    name: "Zoho Desk",
    category: "CRM",
    icon: "/zohodesk.png",
    description: "Tickets, contacts, and help desk automation with Zoho Desk",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#E42527",
    docsUrl: "https://www.zoho.com/desk/developer-guide/",
    capability: {
      entities: ["Ticket", "Contact", "Account", "Agent"],
      triggers: ["New Ticket", "Ticket Updated"],
      actions: ["Create Ticket", "Update Ticket", "Add Comment"],
      flows: []
    }
  },
  {
    key: "netsuite",
    name: "NetSuite",
    category: "ERP",
    icon: "Building",
    description: "Enterprise resource planning and business management",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#FF6600",
    docsUrl: "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/",
    capability: {
      entities: ["Customer", "Invoice", "Sales Order", "Item"],
      triggers: ["New Order", "Invoice Created"],
      actions: ["Create Customer", "Create Invoice"],
      flows: []
    }
  },
  {
    key: "sap",
    name: "SAP",
    category: "ERP",
    icon: "/sap.png",
    description: "Connect with SAP ERP systems",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#0FAAFF",
    docsUrl: "https://help.sap.com/",
    capability: {
      entities: ["Business Partner", "Sales Order", "Invoice"],
      triggers: ["Order Created"],
      actions: ["Create Order"],
      flows: []
    }
  },
  {
    key: "stripe",
    name: "Stripe",
    category: "Payments",
    icon: "/stripe.png",
    description: "Process payments and manage subscriptions with Stripe",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#635BFF",
    docsUrl: "https://stripe.com/docs/api",
    capability: {
      entities: ["Payment", "Customer", "Subscription", "Invoice"],
      triggers: ["Payment Received", "Subscription Created", "Payment Failed"],
      actions: ["Create Payment", "Create Customer", "Create Subscription"],
      flows: []
    }
  },
  {
    key: "paypal",
    name: "PayPal",
    category: "Payments",
    icon: "/paypal.png",
    description: "Accept PayPal payments and manage transactions",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#00457C",
    docsUrl: "https://developer.paypal.com/docs/api/overview/",
    capability: {
      entities: ["Payment", "Order", "Customer"],
      triggers: ["Payment Received", "Order Created"],
      actions: ["Create Payment", "Refund Payment"],
      flows: []
    }
  },
  {
    key: "twilio",
    name: "Twilio",
    category: "Comms",
    icon: "/twilio.png",
    description: "Send SMS and make calls via Twilio",
    oauth: "apikey",
    status: "coming_soon",
    color: "#F22F46",
    docsUrl: "https://www.twilio.com/docs",
    capability: {
      entities: ["Message", "Call", "Contact"],
      triggers: ["Message Received", "Call Completed"],
      actions: ["Send SMS", "Make Call"],
      flows: []
    }
  },
  {
    key: "teams",
    name: "Microsoft Teams",
    category: "Comms",
    icon: "/msteams.png",
    description: "Send messages and notifications to Microsoft Teams",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#6264A7",
    docsUrl: "https://docs.microsoft.com/en-us/graph/teams-concept-overview",
    capability: {
      entities: ["Message", "Channel", "Team"],
      triggers: ["New Message", "Channel Created"],
      actions: ["Send Message", "Create Channel"],
      flows: []
    }
  },
  {
    key: "googledrive",
    name: "Google Drive",
    category: "Cloud",
    icon: "/gdrive.png",
    description: "Manage files and folders in Google Drive",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#4285F4",
    docsUrl: "https://developers.google.com/drive",
    capability: {
      entities: ["File", "Folder"],
      triggers: ["New File", "File Updated"],
      actions: ["Upload File", "Create Folder", "Share File"],
      flows: []
    }
  },
  {
    key: "dropbox",
    name: "Dropbox",
    category: "Cloud",
    icon: "/dropbox.png",
    description: "Store and sync files with Dropbox",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#0061FF",
    docsUrl: "https://www.dropbox.com/developers/documentation",
    capability: {
      entities: ["File", "Folder"],
      triggers: ["New File", "File Modified"],
      actions: ["Upload File", "Create Folder"],
      flows: []
    }
  },
  {
    key: "mailchimp",
    name: "Mailchimp",
    category: "Marketing",
    icon: "/mailchimp.png",
    description: "Manage email campaigns and subscriber lists",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#FFE01B",
    docsUrl: "https://mailchimp.com/developer/",
    capability: {
      entities: ["Campaign", "Subscriber", "List"],
      triggers: ["New Subscriber", "Campaign Sent"],
      actions: ["Add Subscriber", "Send Campaign", "Create List"],
      flows: []
    }
  },
  {
    key: "klaviyo",
    name: "Klaviyo",
    category: "Marketing",
    icon: "Mail",
    description: "Email and SMS marketing automation",
    oauth: "apikey",
    status: "coming_soon",
    color: "#000000",
    docsUrl: "https://developers.klaviyo.com/",
    capability: {
      entities: ["Profile", "Event", "Campaign"],
      triggers: ["New Profile", "Event Tracked"],
      actions: ["Create Profile", "Track Event", "Send Email"],
      flows: []
    }
  },
  {
    key: "asana",
    name: "Asana",
    category: "PM",
    icon: "/asana.png",
    description: "Manage tasks and projects in Asana",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#F06A6A",
    docsUrl: "https://developers.asana.com/docs",
    capability: {
      entities: ["Task", "Project", "Team"],
      triggers: ["New Task", "Task Completed", "Project Created"],
      actions: ["Create Task", "Update Task", "Create Project"],
      flows: []
    }
  },
  {
    key: "trello",
    name: "Trello",
    category: "PM",
    icon: "/trello.png",
    description: "Organize projects with Trello boards and cards",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#0079BF",
    docsUrl: "https://developer.atlassian.com/cloud/trello/",
    capability: {
      entities: ["Board", "Card", "List"],
      triggers: ["New Card", "Card Moved", "Card Completed"],
      actions: ["Create Card", "Update Card", "Create Board"],
      flows: []
    }
  },
  {
    key: "clickup",
    name: "ClickUp",
    category: "PM",
    icon: "CheckCircle",
    description: "All-in-one productivity platform for project management",
    oauth: "oauth2",
    status: "coming_soon",
    color: "#7B68EE",
    docsUrl: "https://clickup.com/api",
    capability: {
      entities: ["Task", "Space", "List"],
      triggers: ["New Task", "Task Updated", "Status Changed"],
      actions: ["Create Task", "Update Task", "Add Comment"],
      flows: []
    }
  }
];

// Helper functions
export function getProviderByKey(key: string): ProviderConfig | undefined {
  return registry.find(p => p.key === key);
}

export function getProvidersByCategory(category: IntegrationCategory): ProviderConfig[] {
  return registry.filter(p => p.category === category);
}

export function getProvidersByStatus(status: IntegrationStatus): ProviderConfig[] {
  return registry.filter(p => p.status === status);
}

export function getAvailableFlows(fromProvider: string, toProvider: string): Flow[] {
  const provider = getProviderByKey(fromProvider);
  if (!provider) return [];
  
  return provider.capability.flows.filter(flow => flow.to === toProvider);
}

export function getAllCategories(): IntegrationCategory[] {
  return ["CRM", "ERP", "Payments", "Comms", "Cloud", "Marketing", "PM"];
}

export function searchProviders(query: string): ProviderConfig[] {
  const lowerQuery = query.toLowerCase();
  return registry.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.capability.entities.some(e => e.toLowerCase().includes(lowerQuery))
  );
}

