"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle, Bell } from "lucide-react";
import { Alert } from "@/lib/utils/dashboard-analytics";

interface SmartAlertsProps {
  alerts: Alert[];
  loading?: boolean;
}

const AlertIcon = ({ type }: { type: Alert['type'] }) => {
  switch (type) {
    case 'urgent':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const AlertCard = ({ alert }: { alert: Alert }) => {
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700 text-white'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const styles = getAlertStyles(alert.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <AlertIcon type={alert.type} />
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold ${styles.text} mb-1`}>
            {alert.title}
          </h4>
          <p className={`text-sm ${styles.text} mb-3`}>
            {alert.message}
          </p>
          {alert.action && (
            <button className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${styles.button}`}>
              {alert.action}
            </button>
          )}
        </div>
        {alert.value !== undefined && (
          <div className="flex-shrink-0 ml-3">
            <div className={`text-right ${styles.text}`}>
              <p className="text-lg font-bold">
                {alert.type === 'urgent' || alert.type === 'warning' ? 
                  `$${alert.value.toLocaleString()}` : 
                  alert.value.toString()
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function SmartAlerts({ alerts, loading = false }: SmartAlertsProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Alerts & Actions</h3>
            <p className="text-sm text-gray-600">Automated insights and recommendations</p>
          </div>
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Group alerts by type for better organization
  const groupedAlerts = {
    urgent: alerts.filter(alert => alert.type === 'urgent'),
    warning: alerts.filter(alert => alert.type === 'warning'),
    info: alerts.filter(alert => alert.type === 'info'),
    success: alerts.filter(alert => alert.type === 'success')
  };

  const hasAlerts = alerts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Alerts & Actions</h3>
          <p className="text-sm text-gray-600">Automated insights and recommendations</p>
        </div>
        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-orange-600" />
        </div>
      </div>

      {!hasAlerts ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h4>
          <p className="text-sm text-gray-600">
            No critical alerts at this time. Your QuickBooks data looks healthy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Urgent Alerts */}
          {groupedAlerts.urgent.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                Urgent ({groupedAlerts.urgent.length})
              </h4>
              <div className="space-y-3">
                {groupedAlerts.urgent.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Warning Alerts */}
          {groupedAlerts.warning.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                Warnings ({groupedAlerts.warning.length})
              </h4>
              <div className="space-y-3">
                {groupedAlerts.warning.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Success Alerts */}
          {groupedAlerts.success.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Success ({groupedAlerts.success.length})
              </h4>
              <div className="space-y-3">
                {groupedAlerts.success.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Info Alerts */}
          {groupedAlerts.info.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="w-4 h-4 text-blue-600 mr-2" />
                Information ({groupedAlerts.info.length})
              </h4>
              <div className="space-y-3">
                {groupedAlerts.info.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {hasAlerts && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''} generated
            </span>
            <span>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
