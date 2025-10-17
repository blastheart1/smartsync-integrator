"use client";

import { motion } from "framer-motion";
import { FileCode2, Users, DollarSign, TrendingUp, RefreshCw, Download, Eye, AlertCircle, Home, BarChart3, Table } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/ui/DataTable";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import QuickBooksDashboard from "@/components/dashboard/QuickBooksDashboard";

interface QBData {
  customers: any[];
  invoices: any[];
  payments: any[];
}

export default function QuickBooksPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "data">("dashboard");
  const [selectedData, setSelectedData] = useState("customers");
  const [data, setData] = useState<QBData>({ customers: [], invoices: [], payments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("Never");
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  // Fetch real QuickBooks data
  const fetchQBData = async () => {
    console.log('🎬 QuickBooks Page - Starting data fetch');
    
    try {
      setLoading(true);
      setError(null);
      showInfo("Fetching QuickBooks data...");
      
      console.log('📞 Fetching customers...');
      const customersRes = await fetch('/api/integrations/quickbooks?query=select * from Customer');
      console.log('👥 Customers response status:', customersRes.status);
      const customersData = await customersRes.json();
      console.log('👥 Customers data:', customersData);
      
      console.log('📞 Fetching invoices...');
      const invoicesRes = await fetch('/api/integrations/quickbooks?query=select * from Invoice');
      console.log('📄 Invoices response status:', invoicesRes.status);
      const invoicesData = await invoicesRes.json();
      console.log('📄 Invoices data:', invoicesData);
      
      console.log('📞 Fetching payments...');
      const paymentsRes = await fetch('/api/integrations/quickbooks?query=select * from Payment');
      console.log('💰 Payments response status:', paymentsRes.status);
      const paymentsData = await paymentsRes.json();
      console.log('💰 Payments data:', paymentsData);
      
      const processedData = {
        customers: customersData.QueryResponse?.Customer || [],
        invoices: invoicesData.QueryResponse?.Invoice || [],
        payments: paymentsData.QueryResponse?.Payment || []
      };
      
      console.log('📊 Processed data structure:', {
        customersCount: processedData.customers.length,
        invoicesCount: processedData.invoices.length,
        paymentsCount: processedData.payments.length
      });
      
      setData(processedData);
      setLastSync(new Date().toLocaleString());
      
      console.log('✅ QuickBooks Page - Data fetch completed successfully');
      showSuccess("QuickBooks data synced successfully!");
      
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('❌ QuickBooks Page - Error during fetch:', err);
      console.error('🔍 Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      
      setError(err instanceof Error ? err.message : 'Failed to fetch QuickBooks data');
      showError("Failed to sync QuickBooks data. Please try again.");
    } finally {
      setLoading(false);
      console.log('🏁 QuickBooks Page - Fetch process finished, loading set to false');
    }
  };

  // Fetch token status
  const fetchTokenStatus = async () => {
    try {
      const response = await fetch('/api/integrations/quickbooks/refresh-token');
      const result = await response.json();
      if (result.success) {
        setTokenInfo(result.tokenInfo);
      }
    } catch (error) {
      console.error('Failed to fetch token status:', error);
    }
  };

  useEffect(() => {
    fetchQBData();
    fetchTokenStatus();
  }, []);

  const dataTypes = [
    { key: "customers", label: "Customers", icon: Users, count: data.customers.length },
    { key: "invoices", label: "Invoices", icon: FileCode2, count: data.invoices.length },
    { key: "payments", label: "Payments", icon: DollarSign, count: data.payments.length }
  ];

  const syncStats = {
    lastSync: lastSync,
    totalRecords: data.customers.length + data.invoices.length + data.payments.length,
    syncStatus: error ? "error" : "success",
    nextSync: "Auto-sync enabled"
  };

  // Column configurations for DataTable
  const getColumns = () => {
    switch (selectedData) {
      case "customers":
        return [
          { key: "Name", label: "Customer Name", sortable: true },
          { key: "PrimaryEmailAddr", label: "Email", sortable: true, render: (value: any) => value?.Address || "N/A" },
          { key: "Balance", label: "Balance", sortable: true, render: (value: any) => `$${value || 0}` },
          { key: "Active", label: "Status", sortable: true, render: (value: any) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
              {value ? "Active" : "Inactive"}
            </span>
          )},
          { key: "Id", label: "ID", sortable: true }
        ];
      case "invoices":
        return [
          { key: "Id", label: "Invoice ID", sortable: true },
          { key: "CustomerRef", label: "Customer", sortable: true, render: (value: any) => value?.name || "N/A" },
          { key: "TotalAmt", label: "Amount", sortable: true, render: (value: any) => `$${value || 0}` },
          { key: "TxnDate", label: "Date", sortable: true },
          { key: "Balance", label: "Status", sortable: true, render: (value: any) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${value > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
              {value > 0 ? "Outstanding" : "Paid"}
            </span>
          )}
        ];
      case "payments":
        return [
          { key: "Id", label: "Payment ID", sortable: true },
          { key: "CustomerRef", label: "Customer", sortable: true, render: (value: any) => value?.name || "N/A" },
          { key: "TotalAmt", label: "Amount", sortable: true, render: (value: any) => `$${value || 0}` },
          { key: "TxnDate", label: "Date", sortable: true },
          { key: "PaymentMethodRef", label: "Method", sortable: true, render: (value: any) => value?.name || "N/A" }
        ];
      default:
        return [];
    }
  };

  const getCurrentData = () => {
    switch (selectedData) {
      case "customers": return data.customers;
      case "invoices": return data.invoices;
      case "payments": return data.payments;
      default: return [];
    }
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
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FileCode2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QuickBooks Online Integration</h1>
              <p className="text-gray-600">Sync and manage your QuickBooks data</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Sync Status</h2>
            <button 
              onClick={fetchQBData}
              disabled={loading}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStats.totalRecords}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">{syncStats.lastSync}</div>
              <div className="text-sm text-gray-600">Last Sync</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error ? 'Error' : 'Success'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-purple-600">{syncStats.nextSync}</div>
              <div className="text-sm text-gray-600">Next Sync</div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Error: {error}</span>
              </div>
            </div>
          )}

          {/* Token Status */}
          {tokenInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Token Status:</span>
                </div>
                <div className="text-sm text-blue-600">
                  {tokenInfo.hasCache ? (
                    tokenInfo.tokenInfo.isExpired ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      <span>Expires in {tokenInfo.tokenInfo.expiresInMinutes} min</span>
                    )
                  ) : (
                    <span>Using Environment Token</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Analytics Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab("data")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "data"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <Table className="w-5 h-5 mr-2" />
                  Raw Data Tables
                </div>
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Dashboard Tab Content */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <QuickBooksDashboard 
              data={data} 
              loading={loading}
              onRefresh={fetchQBData}
            />
          </motion.div>
        )}

        {/* Data Tab Content */}
        {activeTab === "data" && (
          <>
            {/* Data Type Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">QuickBooks Data</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {dataTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => setSelectedData(type.key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedData === type.key
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">{type.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{type.count}</div>
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
                  onClick={fetchQBData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
          </>
        )}
      </div>
    </main>
  );
}