"use client";

import { motion } from "framer-motion";
import { FileCode2, Database, Zap, Settings, TestTube, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const integrations = [
    {
      name: "QuickBooks Online",
      description: "Sync invoices, bills, and payments with QuickBooks Online",
      icon: FileCode2,
      status: "connected",
      lastSync: "2 minutes ago",
      apiEndpoint: "/api/integrations/quickbooks",
      features: ["Invoice Sync", "Payment Tracking", "Customer Management", "Real-time Data"]
    },
    {
      name: "Bill.com",
      description: "Automate payable workflows and vendor management",
      icon: Database,
      status: "connected",
      lastSync: "5 minutes ago",
      apiEndpoint: "/api/integrations/billdotcom",
      features: ["Vendor Management", "Payment Processing", "Invoice Automation", "Spend Tracking"]
    },
    {
      name: "Zapier",
      description: "Connect with 5000+ apps and automate workflows",
      icon: Zap,
      status: "configured",
      lastSync: "1 hour ago",
      apiEndpoint: "/api/integrations/zapier",
      features: ["Workflow Automation", "Multi-app Integration", "Trigger Actions", "Data Sync"]
    }
  ];

  const testResults = {
    quickbooks: { status: "success", message: "Connected to QuickBooks sandbox successfully" },
    billcom: { status: "success", message: "Bill.com API authentication successful" },
    zapier: { status: "warning", message: "Zapier webhook configured but not tested" }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Integration Management</h1>
          <p className="text-gray-600">Manage and monitor your third-party integrations</p>
        </motion.div>

        {/* Integration Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            return (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <div className="flex items-center">
                      {integration.status === "connected" ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        integration.status === "connected" ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
                
                <div className="space-y-2 mb-4">
                  {integration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  Last sync: {integration.lastSync}
                </div>

                <button
                  onClick={() => setActiveTab(integration.name.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Manage Integration
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* API Testing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TestTube className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">API Testing Console</h2>
            </div>
            <div className="flex space-x-2">
              <a 
                href="https://developer.intuit.com/app/developer/qbo/docs/develop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                QuickBooks API Docs
              </a>
              <a 
                href="https://developer.bill.com/docs/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Bill.com API Docs
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{integration.name}</h4>
                <div className="text-xs text-gray-500 mb-2">
                  Endpoint: <code className="bg-gray-100 px-1 rounded">{integration.apiEndpoint}</code>
                </div>
                <button className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                  Test Connection
                </button>
                <div className="mt-2 text-xs">
                  {integration.name === "QuickBooks Online" && (
                    <div className={`flex items-center ${
                      testResults.quickbooks.status === "success" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {testResults.quickbooks.status === "success" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {testResults.quickbooks.message}
                    </div>
                  )}
                  {integration.name === "Bill.com" && (
                    <div className={`flex items-center ${
                      testResults.billcom.status === "success" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {testResults.billcom.status === "success" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {testResults.billcom.message}
                    </div>
                  )}
                  {integration.name === "Zapier" && (
                    <div className={`flex items-center ${
                      testResults.zapier.status === "success" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {testResults.zapier.status === "success" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {testResults.zapier.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Integration Details */}
        {activeTab !== "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {integrations.find(i => i.name.toLowerCase().replace(/\s+/g, '') === activeTab)?.name} Configuration
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">API Credentials</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Client ID</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Enter client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Client Secret</label>
                    <input 
                      type="password" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Enter client secret"
                    />
                  </div>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Save Configuration
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sync Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-600">Enable automatic sync</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Sync on real-time updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-600">Include historical data</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
