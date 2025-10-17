"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Users, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DashboardMetrics } from "@/lib/utils/dashboard-analytics";

interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<any>;
  description?: string;
  delay?: number;
}

const SummaryCard = ({ title, value, change, icon: Icon, description, delay = 0 }: SummaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  </motion.div>
);

interface SummaryCardsProps {
  metrics: DashboardMetrics;
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  // Calculate mock changes for demonstration (in real app, compare with previous period)
  const mockChanges = {
    revenue: 12.5,
    ar: -8.2,
    paymentRate: 5.3,
    customers: 8.7
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SummaryCard
        title="Total Revenue"
        value={metrics.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        change={mockChanges.revenue}
        icon={DollarSign}
        description="Last 30 days"
        delay={0.1}
      />
      <SummaryCard
        title="Outstanding AR"
        value={metrics.outstandingAR.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        change={mockChanges.ar}
        icon={TrendingUp}
        description={`${metrics.daysSalesOutstanding.toFixed(0)} days DSO`}
        delay={0.2}
      />
      <SummaryCard
        title="Payment Rate"
        value={`${metrics.paymentRate.toFixed(1)}%`}
        change={mockChanges.paymentRate}
        icon={Clock}
        description="Collection efficiency"
        delay={0.3}
      />
      <SummaryCard
        title="Active Customers"
        value={metrics.activeCustomers.toString()}
        change={mockChanges.customers}
        icon={Users}
        description="Currently active"
        delay={0.4}
      />
    </div>
  );
}
