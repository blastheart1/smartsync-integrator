"use client";

import { motion } from "framer-motion";
import { Zap, Settings, Play, Copy, ExternalLink, Home, Plus, Trash2, TestTube } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: string;
}

interface ZapTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  category: string;
  isPopular: boolean;
}

export default function ZapierPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  // Available event types from QuickBooks integration
  const availableEvents = [
    { id: "new_customer", name: "New Customer", description: "Triggered when a new customer is created in QuickBooks" },
    { id: "new_invoice", name: "New Invoice", description: "Triggered when a new invoice is created" },
    { id: "invoice_paid", name: "Invoice Paid", description: "Triggered when an invoice is marked as paid" },
    { id: "payment_received", name: "Payment Received", description: "Triggered when a payment is recorded" },
    { id: "customer_updated", name: "Customer Updated", description: "Triggered when customer information is modified" },
    { id: "invoice_updated", name: "Invoice Updated", description: "Triggered when invoice details are changed" },
  ];

  // Pre-built Zap templates for QuickBooks
  const zapTemplates: ZapTemplate[] = [
    {
      id: "invoice_to_slack",
      name: "Invoice Notifications to Slack",
      description: "Get notified in Slack when new invoices are created in QuickBooks",
      trigger: "New Invoice",
      actions: ["Send Slack Message"],
      category: "Notifications",
      isPopular: true
    },
    {
      id: "payment_to_google_sheets",
      name: "Payment Tracking in Google Sheets",
      description: "Automatically log payments to Google Sheets for financial tracking",
      technologies: ["New Payment"],
      actions: ["Add Row to Google Sheets"],
      category: "Data Sync",
      isPopular: true
    },
    {
      id: "customer_to_crm",
      name: "Customer Sync to CRM",
      description: "Sync new QuickBooks customers to your CRM system",
      trigger: "New Customer",
      actions: ["Create Contact in CRM"],
      category: "CRM Integration",
      isPopular: false
    },
    {
      id: "invoice_email_reminder",
      name: "Automated Invoice Reminders",
      description: "Send email reminders for overdue invoices",
      trigger: "Invoice Overdue",
      actions: ["Send Email"],
      category: "Customer Communication",
      isPopular: false
    },
    {
      id: "payment_to_calendar",
      name: "Payment Due Calendar Events",
      description: "Create calendar events for upcoming payment due dates",
      trigger: "New Invoice",
      actions: ["Create Calendar Event"],
      category: "Scheduling",
      isPopular: false
    },
    {
      id: "financial_reports",
      name: "Daily Financial Reports",
      description: "Generate and send daily financial summary reports",
      trigger: "Daily Schedule",
      actions: ["Generate Report", "Send Email"],
      category: "Reporting",
      isPopular: false
    }
  ];

  // Load webhook configurations from localStorage (in real app, this would be from API)
  useEffect(() => {
    const savedWebhooks = localStorage.getItem('zapier-webhooks');
    if (savedWebhooks) {
      setWebhooks(JSON.parse(savedWebhooks));
    }
  }, []);

  // Save webhook configurations
  const saveWebhooks = (updatedWebhooks: WebhookConfig[]) => {
    setWebhooks(updatedWebhooks);
    localStorage.setItem('zapier-webhooks', JSON.stringify(updatedWebhooks));
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || selectedEvents.length === 0) {
      showError("Please fill in all fields and select at least one event");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: selectedEvents,
      isActive: true,
      lastTriggered: "Never"
    };

    saveWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
    setSelectedEvents([]);
    setShowAddWebhook(false);
    showSuccess("Webhook configuration added successfully!");
  };

  const handleDeleteWebhook = (id: string) => {
    saveWebhooks(webhooks.filter(w => w.id !== id));
    showSuccess("Webhook configuration deleted");
  };

  const handleToggleWebhook = (id: string) => {
    const updatedWebhooks = webhooks.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    saveWebhooks(updatedWebhooks);
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setIsTesting(true);
    showInfo(`Testing webhook: ${webhook.name}`);
    
    try {
      const testPayload = {
        event: "test_event",
        data: {
          message: "This is a test webhook from SmartSync Integrator",
          timestamp: new Date().toISOString(),
          webhook_name: webhook.name
        },
        source: "smartsync_integrator"
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        showSuccess(`Test webhook sent successfully to ${webhook.name}`);
        // Update last triggered time
        const updatedWebhooks = webhooks.map(w => 
          w.id === webhook.id ? { ...w, lastTriggered: new Date().toLocaleString() } : w
        );
        saveWebhooks(updatedWebhooks);
      } else {
        showError(`Test webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      showError(`Test webhook failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const copyWebhookURL = (url: string) => {
    navigator.clipboard.writeText(url);
    showSuccess("Webhook URL copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-3xl font-bold text-gray-900">Zapier Integration</h1>
            <Link 
              href="/" 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
          </div>
          <p className="text-gray-600 text-center">Configure webhooks and automation workflows with Zapier</p>
        </motion.div>

        {/* Webhook Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Webhook Configuration</h2>
            </div>
            <button
              onClick={() => setShowAddWebhook(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </button>
          </div>

          {/* Add Webhook Form */}
          {showAddWebhook && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 rounded-lg p-4 mb-6"
            >
              <h3 className="font-medium text-gray-900 mb-4">Add New Webhook</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Name</label>
                  <input
                    type="text"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="e.g., Slack Notifications"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                  <input
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Events to Trigger</label>
                <div className="grid md:grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, event.id]);
                          } else {
                            setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                          }
                        }}
                        className="mr-2"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                        <div className="text-xs text-gray-500">{event.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleAddWebhook}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Webhook
                </button>
                <button
                  onClick={() => setShowAddWebhook(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Webhook List */}
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No webhooks configured yet</p>
              <p className="text-sm">Add your first webhook to start automating workflows</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{webhook.name}</h3>
                      <div className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyWebhookURL(webhook.url)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={isTesting}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                        title="Test Webhook"
                      >
                        <TestTube className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleWebhook(webhook.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={webhook.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Play className={`w-4 h-4 ${webhook.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="font-medium">URL:</div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                      {webhook.url}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="font-medium">Events:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map((eventId) => {
                        const event = availableEvents.find(e => e.id === eventId);
                        return (
                          <span key={eventId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {event?.name || eventId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last triggered: {webhook.lastTriggered}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Zap Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center mb-6">
            <Zap className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">QuickBooks Zap Templates</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zapTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  {template.isPopular && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="space-y-1 mb-3">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Trigger:</span> {template.trigger}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Actions:</span> {template.actions.join(", ")}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Category:</span> {template.category}
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.open('https://zapier.com/apps/quickbooks/integrations', '_blank');
                    showInfo("Opening Zapier QuickBooks integrations in new tab");
                  }}
                  className="w-full flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Create in Zapier
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <ToastContainer />
      </div>
    </div>
  );
}
