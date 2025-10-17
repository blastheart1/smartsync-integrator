"use client";

import { motion } from "framer-motion";
import { Database, Building2, CreditCard, FileText, RefreshCw, Download, Eye, TrendingUp, AlertCircle, Home } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

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

  // Fetch real Bill.com data
  const fetchBillData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch vendors
      const vendorsRes = await fetch('/api/integrations/billdotcom?endpoint=vendors');
      const vendorsData = await vendorsRes.json();
      
      // Fetch bills
      const billsRes = await fetch('/api/integrations/billdotcom?endpoint=bills');
      const billsData = await billsRes.json();
      
      // Fetch payments
      const paymentsRes = await fetch('/api/integrations/billdotcom?endpoint=payments');
      const paymentsData = await paymentsRes.json();
      
      setData({
        vendors: vendorsData.data || vendorsData.vendors || [],
        bills: billsData.data || billsData.bills || [],
        payments: paymentsData.data || paymentsData.payments || [],
        spend: [] // Bill.com spend data would need separate endpoint
      });
      
      setLastSync(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Bill.com data');
      console.error('Bill.com fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillData();
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Database className="w-8 h-8 text-green-600" />
              </div>
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
          className="bg-white rounded-lg shadow-md border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {dataTypes.find(t => t.key === selectedData)?.label} Data
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchBillData}
                  disabled={loading}
                  className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </button>
                <button className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {selectedData === "vendors" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </>
                  )}
                  {selectedData === "bills" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </>
                  )}
                  {selectedData === "payments" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </>
                  )}
                  {selectedData === "spend" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Loading data...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {selectedData === "vendors" && data.vendors.map((vendor: any) => (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vendor.balance || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            vendor.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {vendor.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {selectedData === "bills" && data.bills.map((bill: any) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.invoiceNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.vendor?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bill.amount || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.dueDate || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            bill.status === "Approved" ? "bg-green-100 text-green-800" :
                            bill.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {bill.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.category || 'N/A'}</td>
                      </tr>
                    ))}
                    {selectedData === "payments" && data.payments.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.referenceNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.vendor?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentDate || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentMethod || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {payment.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {selectedData === "spend" && data.spend.map((expense: any) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.transactionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${expense.amount || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.transactionDate || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            expense.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {expense.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {((selectedData === "vendors" && data.vendors.length === 0) ||
                      (selectedData === "bills" && data.bills.length === 0) ||
                      (selectedData === "payments" && data.payments.length === 0) ||
                      (selectedData === "spend" && data.spend.length === 0)) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                          No {dataTypes.find(dt => dt.key === selectedData)?.label.toLowerCase()} found in your Bill.com account.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
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
                <li>• API Key authentication</li>
                <li>• Sandbox environment enabled</li>
                <li>• Organization ID: sandbox-org-id</li>
                <li>• Base URL: gateway.stage.bill.com</li>
                <li>• <a href="https://developer.bill.com/docs/home" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">Official Bill.com API Docs</a></li>
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
        </motion.div>
      </div>
    </main>
  );
}
