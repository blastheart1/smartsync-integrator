"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";
import { RevenueData } from "@/lib/utils/dashboard-analytics";
import { validateChartData, getSafeChartProps, getSafeChartMargins, createSafeTooltipContent } from "@/lib/utils/chart-utils";

interface RevenueChartProps {
  data: RevenueData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`Revenue: $${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <p className="text-sm text-gray-600">Revenue over the last 30 days</p>
          </div>
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </motion.div>
    );
  }

  // Validate and clean the data
  const safeData = validateChartData(data);
  
  if (safeData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <p className="text-sm text-gray-600">Revenue over the last 30 days</p>
          </div>
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No revenue data available</p>
        </div>
      </motion.div>
    );
  }

  const totalRevenue = safeData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const avgDailyRevenue = totalRevenue / (safeData.length || 1);
  const trend = safeData.length > 1 && safeData[0].revenue > 0 ? 
    ((safeData[safeData.length - 1].revenue - safeData[0].revenue) / safeData[0].revenue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          <p className="text-sm text-gray-600">Revenue over the last 30 days</p>
        </div>
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            ${avgDailyRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Daily Average</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Trend</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 min-h-[256px]">
        <ResponsiveContainer {...getSafeChartProps()}>
          <AreaChart data={safeData} margin={getSafeChartMargins()}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
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
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={(props) => createSafeTooltipContent(
              props.active, 
              props.payload, 
              props.label,
              [{ key: 'revenue', label: 'Revenue', formatter: (value) => `$${Number(value).toLocaleString()}` }]
            )} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      {safeData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Insight:</strong> {trend >= 0 ? 'Revenue is trending upward' : 'Revenue has declined'} 
            {Math.abs(trend) > 5 && ` with a ${Math.abs(trend).toFixed(1)}% change`} over the period.
          </p>
        </div>
      )}
    </motion.div>
  );
}
