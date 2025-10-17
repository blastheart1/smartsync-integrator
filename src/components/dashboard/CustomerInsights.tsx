"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomerInsight } from "@/lib/utils/dashboard-analytics";
import { validateChartData, getSafeChartProps, getSafeChartMargins, createSafeTooltipContent } from "@/lib/utils/chart-utils";
import { useChartDimensions } from "@/lib/hooks/useChartDimensions";

interface CustomerInsightsProps {
  customers: CustomerInsight[];
  loading?: boolean;
}

const CustomerTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label || 'Customer'}</p>
        <p className="text-sm text-gray-600">Revenue: ${(data.totalRevenue || 0).toLocaleString()}</p>
        <p className="text-sm text-gray-600">Invoices: {data.invoiceCount || 0}</p>
        <p className="text-sm text-gray-600">Balance: ${(data.outstandingBalance || 0).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function CustomerInsights({ customers, loading = false }: CustomerInsightsProps) {
  const { width, height, isReady, containerRef } = useChartDimensions(300, 200);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
            <p className="text-sm text-gray-600">Top customers by revenue</p>
          </div>
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </motion.div>
    );
  }

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalRevenue, 0);
  const topCustomersRevenue = customers.slice(0, 3).reduce((sum, customer) => sum + customer.totalRevenue, 0);
  const concentrationPercentage = totalRevenue > 0 ? (topCustomersRevenue / totalRevenue) * 100 : 0;

  // Validate and prepare chart data (top 8 customers for better visualization)
  const safeCustomers = validateChartData(customers);
  const chartData = safeCustomers.slice(0, 8).map(customer => ({
    name: (customer.name || 'Unknown').length > 15 ? (customer.name || 'Unknown').substring(0, 15) + '...' : (customer.name || 'Unknown'),
    fullName: customer.name || 'Unknown',
    revenue: customer.totalRevenue || 0,
    invoices: customer.invoiceCount || 0,
    balance: customer.outstandingBalance || 0
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
          <p className="text-sm text-gray-600">Top customers by revenue</p>
        </div>
        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-green-600" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          <p className="text-sm text-gray-600">Active Customers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {concentrationPercentage.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600">Top 3 Concentration</p>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="h-64 min-h-[256px] mb-6">
        {isReady && width > 0 && height > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
            <BarChart data={chartData} margin={{ ...getSafeChartMargins(), bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={(props) => createSafeTooltipContent(
              props.active, 
              props.payload, 
              props.label,
              [
                { key: 'revenue', label: 'Revenue', formatter: (value) => `$${Number(value).toLocaleString()}` },
                { key: 'invoices', label: 'Invoices', formatter: (value) => Number(value).toString() },
                { key: 'balance', label: 'Balance', formatter: (value) => `$${Number(value).toLocaleString()}` }
              ]
            )} />
            <Bar 
              dataKey="revenue" 
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <span className="text-gray-500 text-sm">Preparing chart...</span>
          </div>
        )}
      </div>

      {/* Top Customers List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Top Customers</h4>
        {customers.slice(0, 5).map((customer, index) => (
          <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-semibold text-green-600">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {customer.name.length > 30 ? customer.name.substring(0, 30) + '...' : customer.name}
                </p>
                <p className="text-xs text-gray-500">{customer.invoiceCount} invoices</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${customer.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Balance: ${customer.outstandingBalance.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      {customers.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            💡 <strong>Insight:</strong> Top {Math.min(3, customers.length)} customers account for {concentrationPercentage.toFixed(0)}% of total revenue.
            {concentrationPercentage > 70 && ' Consider diversifying your customer base to reduce risk.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
