"use client";

import { motion } from "framer-motion";
import { Building2, CreditCard, FileText, RefreshCw, Download, Eye, TrendingUp, AlertCircle, Home } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/ui/DataTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";

interface BillData {
  vendors: any[];
  bills: any[];
  payments: any[];
  spend: any[];
}

export default function BillComPage() {
  const [selectedData, setSelectedData] = useState("vendors");
  const [data, setData] = useState<BillData>({ vendors: [], bills: [], payments: [], spend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("Never");
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  // Fetch real Bill.com data
  const fetchBillData = async () => {
    try {
      setLoading(true);
      setError(null);
      showInfo("Fetching Bill.com data...");
      
      console.log('🔍 Starting Bill.com data fetch...');
      
      // Fetch vendors
      console.log('📞 Fetching vendors...');
      const vendorsRes = await fetch('/api/integrations/billdotcom?endpoint=vendors');
      console.log('📊 Vendors response status:', vendorsRes.status);
      const vendorsData = await vendorsRes.json();
      console.log('📊 Vendors data received:', vendorsData);
      
      // Fetch bills
      console.log('📞 Fetching bills...');
      const billsRes = await fetch('/api/integrations/billdotcom?endpoint=bills');
      console.log('📊 Bills response status:', billsRes.status);
      const billsData = await billsRes.json();
      console.log('📊 Bills data received:', billsData);
      
      // Fetch payments
      console.log('📞 Fetching payments...');
      const paymentsRes = await fetch('/api/integrations/billdotcom?endpoint=payments');
      console.log('📊 Payments response status:', paymentsRes.status);
      const paymentsData = await paymentsRes.json();
      console.log('📊 Payments data received:', paymentsData);
      
      const processedData = {
        vendors: vendorsData.data || vendorsData.vendors || [],
        bills: billsData.data || billsData.bills || [],
        payments: paymentsData.data || paymentsData.payments || [],
        spend: [] // Bill.com spend data would need separate endpoint
      };
      
      console.log('📊 Processed data structure:', {
        vendors: processedData.vendors.length,
        bills: processedData.bills.length,
        payments: processedData.payments.length,
        spend: processedData.spend.length
      });
      
      setData(processedData);
      setLastSync(new Date().toLocaleString());
      showSuccess(`Bill.com data synced successfully! Found ${processedData.vendors.length + processedData.bills.length + processedData.payments.length} records.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Bill.com data';
      setError(errorMessage);
      console.error('❌ Bill.com fetch error:', err);
      showError(`Failed to sync Bill.com data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch session status
  const fetchSessionStatus = async () => {
    try {
      const response = await fetch('/api/integrations/billcom/session');
      const result = await response.json();
      if (result.success) {
        setSessionInfo(result.sessionInfo);
      }
    } catch (error) {
      console.error('Failed to fetch Bill.com session status:', error);
    }
  };

  useEffect(() => {
    fetchBillData();
    fetchSessionStatus();
  }, []);

  // Data table functions
  const getCurrentData = () => {
    switch (selectedData) {
      case 'vendors': return data.vendors;
      case 'bills': return data.bills;
      case 'payments': return data.payments;
      case 'spend': return data.spend;
      default: return [];
    }
  };

  const getColumns = () => {
    switch (selectedData) {
      case 'vendors':
        return [
          { key: 'name', label: 'Vendor Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'balance', label: 'Balance', sortable: true, render: (value: number) => `$${value.toFixed(2)}` },
          { key: 'isActive', label: 'Status', sortable: true, render: (value: boolean) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}>
              {value ? "Active" : "Inactive"}
            </span>
          )}
        ];
      case 'bills':
        return [
          { key: 'invoiceNumber', label: 'Invoice Number', sortable: true },
          { key: 'vendor.name', label: 'Vendor', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true, render: (value: number) => `$${value.toFixed(2)}` },
          { key: 'dueDate', label: 'Due Date', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: (value: string) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === "Approved" ? "bg-green-100 text-green-800" :
              value === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
            }`}>
              {value || 'Unknown'}
            </span>
          )},
          { key: 'category', label: 'Category', sortable: true }
        ];
      case 'payments':
        return [
          { key: 'referenceNumber', label: 'Reference Number', sortable: true },
          { key: 'vendor.name', label: 'Vendor', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true, render: (value: number) => `$${value.toFixed(2)}` },
          { key: 'paymentDate', label: 'Payment Date', sortable: true },
          { key: 'paymentMethod', label: 'Method', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: (value: string) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}>
              {value || 'Unknown'}
            </span>
          )}
        ];
      case 'spend':
        return [
          { key: 'transactionId', label: 'Transaction ID', sortable: true },
          { key: 'user.name', label: 'Employee', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true, render: (value: number) => `$${value.toFixed(2)}` },
          { key: 'transactionDate', label: 'Date', sortable: true },
          { key: 'category', label: 'Category', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: (value: string) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}>
              {value || 'Unknown'}
            </span>
          )}
        ];
      default:
        return [];
    }
  };

  const dataTypes = [
    { key: "vendors", label: "Vendors", icon: Building2, count: data.vendors.length },
    { key: "bills", label: "Bills", icon: FileText, count: data.bills.length },
    { key: "payments", label: "Payments", icon: CreditCard, count: data.payments.length },
    { key: "spend", label: "Spend & Expense", icon: TrendingUp, count: data.spend.length }
  ];

  const syncStats = {
    lastSync: lastSync,
    totalRecords: data.vendors.length + data.bills.length + data.payments.length + data.spend.length,
    syncStatus: error ? "error" : "success",
    nextSync: "Auto-sync enabled",
    pendingBills: data.bills.filter((bill: any) => bill.status === 'Pending').length,
    totalSpend: data.spend.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Image src="/billcom.png" alt="Bill.com" width={32} height={32} className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bill.com Integration</h1>
                <p className="text-gray-600">Manage vendors, bills, and payments with Bill.com</p>
              </div>
            </div>
            <Link 
              href="/"
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Link>
          </div>
        </motion.div>

        {/* Sync Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bill.com Sync Status</h2>
            <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </button>
          </div>
          
          <div className="grid md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStats.totalRecords}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncStats.lastSync}</div>
              <div className="text-sm text-gray-600">Last Sync</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Success</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{syncStats.pendingBills}</div>
              <div className="text-sm text-gray-600">Pending Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${syncStats.totalSpend}</div>
              <div className="text-sm text-gray-600">Total Spend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{syncStats.nextSync}</div>
              <div className="text-sm text-gray-600">Next Sync</div>
            </div>
          </div>
        </motion.div>

        {/* Session Status */}
        {sessionInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-800">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Bill.com Session Status:</span>
              </div>
              <div className="text-sm text-green-600">
                {sessionInfo.hasSession ? (
                  sessionInfo.sessionInfo.isExpired ? (
                    <span className="text-red-600">Session Expired</span>
                  ) : (
                    <span>Expires in {sessionInfo.sessionInfo.expiresInMinutes} min</span>
                  )
                ) : (
                  <span>No Active Session</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Data Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill.com Data</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {dataTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => setSelectedData(type.key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedData === type.key
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{type.count}</div>
                  <div className="text-sm text-gray-500">records</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <LoadingSkeleton rows={8} columns={5} />
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchBillData}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <DataTable
              data={getCurrentData()}
              columns={getColumns()}
              title={`${dataTypes.find(t => t.key === selectedData)?.label} Data`}
              searchable={true}
              exportable={true}
              onExport={() => {
                showSuccess(`${dataTypes.find(t => t.key === selectedData)?.label} data exported successfully!`);
              }}
            />
          )}
        </motion.div>

        {/* API Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200"
        >
          <h3 className="text-lg font-semibold text-green-900 mb-4">Bill.com v3 API Integration</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-green-900 mb-2">Authentication & Setup</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Session-based authentication</li>
                <li>• Developer key required</li>
                <li>• Sandbox environment available</li>
                <li>• Base URL: api.bill.com/api/v3/</li>
                <li>• <a href="https://developer.bill.com/docs/home" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">Official Bill.com v3 API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">v3 API Workflows</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>AP:</strong> Vendors, Bills, Payments</li>
                <li>• <strong>AR:</strong> Customers, Invoices, Credit Memos</li>
                <li>• <strong>Spend & Expense:</strong> Cards, Transactions</li>
                <li>• <strong>BILL Network:</strong> Vendor connections</li>
                <li>• <strong>Webhooks:</strong> Real-time notifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Integration Capabilities</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Automated bill processing</li>
                <li>• Vendor payment workflows</li>
                <li>• Spend & expense management</li>
                <li>• Real-time webhook notifications</li>
                <li>• Multi-payment method support</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Real API Integration:</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Real Bill.com v3 API integration is now active! Add BILL_PASSWORD and BILL_ORG_ID to your environment variables to use real data instead of mock data.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
