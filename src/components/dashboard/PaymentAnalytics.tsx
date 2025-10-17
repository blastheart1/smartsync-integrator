"use client";

import { motion } from "framer-motion";
import { CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PaymentStatusData, AgingData } from "@/lib/utils/dashboard-analytics";
import { validateChartData, getSafeChartProps, getSafeChartMargins, createSafeTooltipContent } from "@/lib/utils/chart-utils";

interface PaymentAnalyticsProps {
  paymentStatus: PaymentStatusData[];
  agingData: AgingData[];
  loading?: boolean;
}

const PaymentTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    const total = payload.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name || 'Status'}</p>
        <p className="text-sm text-gray-600">Count: {data.value || 0}</p>
        <p className="text-sm text-gray-600">
          Percentage: {total > 0 ? (((data.value || 0) / total) * 100).toFixed(1) : 0}%
        </p>
      </div>
    );
  }
  return null;
};

const AgingTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label || 'Aging Range'}</p>
        <p className="text-sm text-gray-600">Amount: ${(data.amount || 0).toLocaleString()}</p>
        <p className="text-sm text-gray-600">Count: {data.count || 0} invoices</p>
      </div>
    );
  }
  return null;
};

export default function PaymentAnalytics({ paymentStatus, agingData, loading = false }: PaymentAnalyticsProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Performance</h3>
            <p className="text-sm text-gray-600">Payment status and aging analysis</p>
          </div>
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </motion.div>
    );
  }

  // Validate data
  const safePaymentStatus = validateChartData(paymentStatus);
  const safeAgingData = validateChartData(agingData);

  const totalInvoices = safePaymentStatus.reduce((sum, status) => sum + (status.value || 0), 0);
  const paidInvoices = safePaymentStatus.find(s => s.name === 'Paid')?.value || 0;
  const overdueInvoices = safePaymentStatus.find(s => s.name === 'Overdue')?.value || 0;
  const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

  const totalAgingAmount = safeAgingData.reduce((sum, aging) => sum + (aging.amount || 0), 0);
  const overdueAmount = safeAgingData.filter(aging => aging.range === '31-60 days' || aging.range === '60+ days')
    .reduce((sum, aging) => sum + (aging.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Performance</h3>
          <p className="text-sm text-gray-600">Payment status and aging analysis</p>
        </div>
        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{paymentRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Payment Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{overdueInvoices}</p>
          <p className="text-sm text-gray-600">Overdue Invoices</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            ${overdueAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Overdue Amount</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
          <p className="text-sm text-gray-600">Total Invoices</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Status Pie Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Payment Status Distribution</h4>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer {...getSafeChartProps()}>
              <PieChart>
                <Pie
                  data={safePaymentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {safePaymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip content={(props) => createSafeTooltipContent(
                  props.active, 
                  props.payload, 
                  props.label,
                  [
                    { key: 'value', label: 'Count', formatter: (value) => Number(value).toString() }
                  ]
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aging Report Bar Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Aging Report</h4>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer {...getSafeChartProps()}>
              <BarChart data={safeAgingData} margin={getSafeChartMargins()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="range" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
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
                    { key: 'amount', label: 'Amount', formatter: (value) => `$${Number(value).toLocaleString()}` },
                    { key: 'count', label: 'Count', formatter: (value) => Number(value).toString() }
                  ]
                )} />
                <Bar 
                  dataKey="amount" 
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Aging Details */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Aging Details</h4>
        {safeAgingData.map((aging, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3" 
                style={{ backgroundColor: aging.color }}
              ></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{aging.range}</p>
                <p className="text-xs text-gray-500">{aging.count} invoices</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${aging.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {totalAgingAmount > 0 ? ((aging.amount / totalAgingAmount) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-4 space-y-2">
        {paymentRate < 80 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Payment collection rate is below 80%. Consider reviewing payment terms.
              </p>
            </div>
          </div>
        )}
        
        {overdueInvoices > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-sm text-red-800">
                {overdueInvoices} invoices are overdue. Send collection reminders.
              </p>
            </div>
          </div>
        )}
        
        {paymentRate >= 90 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                Excellent payment collection rate! Keep up the good work.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
