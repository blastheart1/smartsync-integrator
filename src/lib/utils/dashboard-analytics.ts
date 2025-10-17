/**
 * QuickBooks Dashboard Analytics Utilities
 * Processes raw QB data into actionable insights and visualizations
 */

export interface QBData {
  customers: any[];
  invoices: any[];
  payments: any[];
}

export interface DashboardMetrics {
  totalRevenue: number;
  outstandingAR: number;
  paymentRate: number;
  activeCustomers: number;
  averageInvoiceAmount: number;
  daysSalesOutstanding: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  invoices: number;
  customers: number;
}

export interface CustomerInsight {
  id: string;
  name: string;
  totalRevenue: number;
  invoiceCount: number;
  lastInvoiceDate: string;
  outstandingBalance: number;
  paymentSpeed: number; // days
}

export interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

export interface AgingData {
  range: string;
  amount: number;
  count: number;
  color: string;
}

export interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
  value?: number;
}

/**
 * Calculate key dashboard metrics
 */
export function calculateDashboardMetrics(data: QBData): DashboardMetrics {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Calculate total revenue from payments in last 30 days
  const recentPayments = data.payments.filter(payment => {
    const paymentDate = new Date(payment.TxnDate);
    return paymentDate >= thirtyDaysAgo;
  });
  const totalRevenue = recentPayments.reduce((sum, payment) => sum + (payment.TotalAmt || 0), 0);
  
  // Calculate outstanding AR from invoices
  const outstandingAR = data.invoices.reduce((sum, invoice) => {
    const balance = invoice.Balance || 0;
    return sum + balance;
  }, 0);
  
  // Calculate payment rate
  const totalInvoiced = data.invoices.reduce((sum, invoice) => sum + (invoice.TotalAmt || 0), 0);
  const paymentRate = totalInvoiced > 0 ? ((totalInvoiced - outstandingAR) / totalInvoiced) * 100 : 0;
  
  // Count active customers
  const activeCustomers = data.customers.filter(customer => customer.Active).length;
  
  // Calculate average invoice amount
  const averageInvoiceAmount = data.invoices.length > 0 
    ? data.invoices.reduce((sum, invoice) => sum + (invoice.TotalAmt || 0), 0) / data.invoices.length 
    : 0;
  
  // Calculate Days Sales Outstanding (simplified)
  const daysSalesOutstanding = calculateDSO(data.invoices, data.payments);
  
  return {
    totalRevenue,
    outstandingAR,
    paymentRate,
    activeCustomers,
    averageInvoiceAmount,
    daysSalesOutstanding
  };
}

/**
 * Process revenue data for time series charts
 */
export function processRevenueData(data: QBData): RevenueData[] {
  const revenueMap = new Map<string, { revenue: number; invoices: number; customers: Set<string> }>();
  
  // Process payments by date
  data.payments.forEach(payment => {
    const date = payment.TxnDate;
    const existing = revenueMap.get(date) || { revenue: 0, invoices: 0, customers: new Set() };
    existing.revenue += payment.TotalAmt || 0;
    revenueMap.set(date, existing);
  });
  
  // Process invoices by date
  data.invoices.forEach(invoice => {
    const date = invoice.TxnDate;
    const existing = revenueMap.get(date) || { revenue: 0, invoices: 0, customers: new Set() };
    existing.invoices += 1;
    if (invoice.CustomerRef?.value) {
      existing.customers.add(invoice.CustomerRef.value);
    }
    revenueMap.set(date, existing);
  });
  
  // Convert to array and sort by date
  return Array.from(revenueMap.entries())
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: data.revenue,
      invoices: data.invoices,
      customers: data.customers.size
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days
}

/**
 * Generate customer insights
 */
export function generateCustomerInsights(data: QBData): CustomerInsight[] {
  const customerMap = new Map<string, CustomerInsight>();
  
  // Initialize customers
  data.customers.forEach(customer => {
    if (customer.Active) {
      customerMap.set(customer.Id, {
        id: customer.Id,
        name: customer.DisplayName || customer.CompanyName || 'Unknown',
        totalRevenue: 0,
        invoiceCount: 0,
        lastInvoiceDate: '',
        outstandingBalance: customer.Balance || 0,
        paymentSpeed: 0
      });
    }
  });
  
  // Process invoices
  data.invoices.forEach(invoice => {
    const customerId = invoice.CustomerRef?.value;
    if (customerId && customerMap.has(customerId)) {
      const customer = customerMap.get(customerId)!;
      customer.totalRevenue += invoice.TotalAmt || 0;
      customer.invoiceCount += 1;
      
      const invoiceDate = new Date(invoice.TxnDate);
      const lastDate = customer.lastInvoiceDate ? new Date(customer.lastInvoiceDate) : new Date(0);
      if (invoiceDate > lastDate) {
        customer.lastInvoiceDate = invoice.TxnDate;
      }
    }
  });
  
  // Process payments for payment speed calculation
  data.payments.forEach(payment => {
    const customerId = payment.CustomerRef?.value;
    if (customerId && customerMap.has(customerId)) {
      const customer = customerMap.get(customerId)!;
      // Calculate average payment speed (simplified)
      customer.paymentSpeed = Math.random() * 30 + 10; // Placeholder calculation
    }
  });
  
  return Array.from(customerMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10); // Top 10 customers
}

/**
 * Generate payment status distribution
 */
export function generatePaymentStatusData(data: QBData): PaymentStatusData[] {
  const totalInvoices = data.invoices.length;
  const paidInvoices = data.invoices.filter(invoice => (invoice.Balance || 0) === 0).length;
  const overdueInvoices = data.invoices.filter(invoice => {
    const balance = invoice.Balance || 0;
    const dueDate = new Date(invoice.DueDate);
    const now = new Date();
    return balance > 0 && dueDate < now;
  }).length;
  const pendingInvoices = totalInvoices - paidInvoices - overdueInvoices;
  
  return [
    { name: 'Paid', value: paidInvoices, color: '#10B981' },
    { name: 'Pending', value: pendingInvoices, color: '#F59E0B' },
    { name: 'Overdue', value: overdueInvoices, color: '#EF4444' }
  ];
}

/**
 * Generate aging report data
 */
export function generateAgingData(data: QBData): AgingData[] {
  const now = new Date();
  const agingRanges = [
    { range: 'Current', days: 0, color: '#10B981' },
    { range: '1-30 days', days: 30, color: '#3B82F6' },
    { range: '31-60 days', days: 60, color: '#F59E0B' },
    { range: '60+ days', days: Infinity, color: '#EF4444' }
  ];
  
  return agingRanges.map(range => {
    let amount = 0;
    let count = 0;
    
    data.invoices.forEach(invoice => {
      const balance = invoice.Balance || 0;
      if (balance > 0) {
        const dueDate = new Date(invoice.DueDate);
        const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (range.days === 0 && daysPastDue <= 0) {
          amount += balance;
          count += 1;
        } else if (range.days === 30 && daysPastDue > 0 && daysPastDue <= 30) {
          amount += balance;
          count += 1;
        } else if (range.days === 60 && daysPastDue > 30 && daysPastDue <= 60) {
          amount += balance;
          count += 1;
        } else if (range.days === Infinity && daysPastDue > 60) {
          amount += balance;
          count += 1;
        }
      }
    });
    
    return {
      range: range.range,
      amount,
      count,
      color: range.color
    };
  });
}

/**
 * Generate smart alerts and recommendations
 */
export function generateSmartAlerts(data: QBData): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  
  // Check for overdue invoices
  const overdueInvoices = data.invoices.filter(invoice => {
    const balance = invoice.Balance || 0;
    const dueDate = new Date(invoice.DueDate);
    const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return balance > 0 && daysPastDue > 60;
  });
  
  if (overdueInvoices.length > 0) {
    const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + (invoice.Balance || 0), 0);
    alerts.push({
      id: 'overdue-invoices',
      type: 'urgent',
      title: `${overdueInvoices.length} invoices over 60 days past due`,
      message: `Total amount: $${totalOverdue.toLocaleString()}`,
      action: 'Send collection reminders',
      value: totalOverdue
    });
  }
  
  // Check for revenue trends
  const recentRevenue = data.payments
    .filter(payment => {
      const paymentDate = new Date(payment.TxnDate);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return paymentDate >= sevenDaysAgo;
    })
    .reduce((sum, payment) => sum + (payment.TotalAmt || 0), 0);
  
  const previousWeekRevenue = data.payments
    .filter(payment => {
      const paymentDate = new Date(payment.TxnDate);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return paymentDate >= fourteenDaysAgo && paymentDate < sevenDaysAgo;
    })
    .reduce((sum, payment) => sum + (payment.TotalAmt || 0), 0);
  
  if (previousWeekRevenue > 0) {
    const change = ((recentRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;
    if (change < -10) {
      alerts.push({
        id: 'revenue-decline',
        type: 'warning',
        title: 'Revenue down this week',
        message: `${Math.abs(change).toFixed(1)}% decrease from last week`,
        action: 'Review sales pipeline',
        value: change
      });
    } else if (change > 20) {
      alerts.push({
        id: 'revenue-increase',
        type: 'success',
        title: 'Revenue up this week',
        message: `${change.toFixed(1)}% increase from last week`,
        value: change
      });
    }
  }
  
  // Check for inactive customers
  const inactiveCustomers = data.customers.filter(customer => {
    if (!customer.Active) return false;
    const lastInvoice = data.invoices
      .filter(invoice => invoice.CustomerRef?.value === customer.Id)
      .sort((a, b) => new Date(b.TxnDate).getTime() - new Date(a.TxnDate).getTime())[0];
    
    if (!lastInvoice) return false;
    const lastInvoiceDate = new Date(lastInvoice.TxnDate);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return lastInvoiceDate < thirtyDaysAgo;
  });
  
  if (inactiveCustomers.length > 0) {
    alerts.push({
      id: 'inactive-customers',
      type: 'info',
      title: `${inactiveCustomers.length} customers inactive`,
      message: 'No invoices in the last 30 days',
      action: 'Schedule customer outreach',
      value: inactiveCustomers.length
    });
  }
  
  return alerts;
}

/**
 * Calculate Days Sales Outstanding (DSO)
 */
function calculateDSO(invoices: any[], payments: any[]): number {
  const now = new Date();
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + (invoice.Balance || 0), 0);
  const averageDailySales = payments.reduce((sum, payment) => {
    const paymentDate = new Date(payment.TxnDate);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (paymentDate >= thirtyDaysAgo) {
      return sum + (payment.TotalAmt || 0);
    }
    return sum;
  }, 0) / 30;
  
  return averageDailySales > 0 ? totalOutstanding / averageDailySales : 0;
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
