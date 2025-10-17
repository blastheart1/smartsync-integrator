"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, BarChart3, Download } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Import dashboard components
import SummaryCards from "./SummaryCards";
import RevenueChart from "./RevenueChart";
import CustomerInsights from "./CustomerInsights";
import PaymentAnalytics from "./PaymentAnalytics";
import SmartAlerts from "./SmartAlerts";

// Import analytics utilities
import {
  QBData,
  calculateDashboardMetrics,
  processRevenueData,
  generateCustomerInsights,
  generatePaymentStatusData,
  generateAgingData,
  generateSmartAlerts
} from "@/lib/utils/dashboard-analytics";

interface QuickBooksDashboardProps {
  data: QBData;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function QuickBooksDashboard({ data, loading = false, onRefresh }: QuickBooksDashboardProps) {
  const [dashboardData, setDashboardData] = useState({
    metrics: null as any,
    revenueData: [] as any[],
    customerInsights: [] as any[],
    paymentStatus: [] as any[],
    agingData: [] as any[],
    alerts: [] as any[]
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError, showInfo, ToastContainer } = useToast();

  // Process dashboard data
  const processDashboardData = async () => {
    if (!data || loading) return;
    
    setIsProcessing(true);
    try {
      // Calculate all metrics and insights
      const metrics = calculateDashboardMetrics(data);
      const revenueData = processRevenueData(data);
      const customerInsights = generateCustomerInsights(data);
      const paymentStatus = generatePaymentStatusData(data);
      const agingData = generateAgingData(data);
      const alerts = generateSmartAlerts(data);

      setDashboardData({
        metrics,
        revenueData,
        customerInsights,
        paymentStatus,
        agingData,
        alerts
      });

      showSuccess("Dashboard data updated successfully!");
    } catch (error) {
      console.error('Error processing dashboard data:', error);
      showError("Failed to process dashboard data");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    processDashboardData();
  }, [data]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    processDashboardData();
  };

  const handleExportData = () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        metrics: dashboardData.metrics,
        revenueData: dashboardData.revenueData,
        customerInsights: dashboardData.customerInsights,
        paymentStatus: dashboardData.paymentStatus,
        agingData: dashboardData.agingData,
        alerts: dashboardData.alerts
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quickbooks-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess("Dashboard data exported successfully!");
    } catch (error) {
      console.error('Error exporting data:', error);
      showError("Failed to export dashboard data");
    }
  };

  if (loading || isProcessing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QuickBooks Analytics Dashboard</h2>
            <p className="text-gray-600">Real-time insights and actionable analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QuickBooks Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time insights and actionable analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportData}
            disabled={!dashboardData.metrics}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleRefresh}
            disabled={isProcessing}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {dashboardData.metrics && (
        <SummaryCards metrics={dashboardData.metrics} />
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <RevenueChart 
          data={dashboardData.revenueData} 
          loading={!dashboardData.revenueData.length}
        />

        {/* Customer Insights */}
        <CustomerInsights 
          customers={dashboardData.customerInsights} 
          loading={!dashboardData.customerInsights.length}
        />
      </div>

      {/* Payment Analytics */}
      <PaymentAnalytics 
        paymentStatus={dashboardData.paymentStatus}
        agingData={dashboardData.agingData}
        loading={!dashboardData.paymentStatus.length || !dashboardData.agingData.length}
      />

      {/* Smart Alerts */}
      <SmartAlerts 
        alerts={dashboardData.alerts}
        loading={!dashboardData.alerts.length && dashboardData.metrics}
      />

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Data refreshes automatically every 5 minutes</span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
