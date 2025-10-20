"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";

interface SyncLog {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  rowsProcessed: number;
  rowsFailed: number;
  errorMessage?: string;
  mapping: {
    name: string;
    targetType: string;
    targetEntity: string;
  };
}

interface SyncStatus {
  isRunning: boolean;
  lastSync?: string;
  nextSync?: string;
  successRate?: number;
}

interface SyncMonitoringProps {
  mappingId: string;
  mappingName: string;
  targetType: string;
  targetEntity: string;
  isActive: boolean;
  onToggleActive: () => void;
}

export default function SyncMonitoring({
  mappingId,
  mappingName,
  targetType,
  targetEntity,
  isActive,
  onToggleActive
}: SyncMonitoringProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringSync, setTriggeringSync] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSyncData();
  }, [mappingId]);

  const fetchSyncData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sync status and logs in parallel
      const [statusResponse, logsResponse] = await Promise.all([
        fetch(`/api/sync/trigger?mappingId=${mappingId}`),
        fetch(`/api/sync/logs/${mappingId}?limit=10`)
      ]);

      const [statusData, logsData] = await Promise.all([
        statusResponse.json(),
        logsResponse.json()
      ]);

      if (statusData.success) {
        setSyncStatus(statusData.data);
      }

      if (logsData.success) {
        setSyncLogs(logsData.data.logs);
      }
    } catch (err) {
      setError("Failed to load sync data");
    } finally {
      setLoading(false);
    }
  };

  const triggerManualSync = async () => {
    try {
      setTriggeringSync(true);
      setError(null);

      const response = await fetch("/api/sync/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappingId })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data after successful sync
        await fetchSyncData();
      } else {
        setError(data.error || "Failed to trigger sync");
      }
    } catch (err) {
      setError("Failed to trigger sync");
    } finally {
      setTriggeringSync(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = end.getTime() - start.getTime();
    
    if (duration < 1000) return "< 1s";
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status Widget */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerManualSync}
              disabled={triggeringSync || syncStatus?.isRunning}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {triggeringSync ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {triggeringSync ? "Triggering..." : "Trigger Now"}
            </button>
            
            <button
              onClick={onToggleActive}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {syncStatus?.isRunning ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium text-gray-900">
              {syncStatus?.isRunning ? "Running" : "Idle"}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Last Sync</p>
            <p className="font-medium text-gray-900">
              {syncStatus?.lastSync ? formatDate(syncStatus.lastSync) : "Never"}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="font-medium text-gray-900">
              {syncStatus?.successRate ? `${Math.round(syncStatus.successRate)}%` : "N/A"}
            </p>
          </div>
        </div>

        {syncStatus?.nextSync && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next sync:</strong> {formatDate(syncStatus.nextSync)}
            </p>
          </div>
        )}
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
            <button
              onClick={fetchSyncData}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {syncLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg mb-2">No sync logs yet</p>
              <p className="text-sm">Sync activity will appear here once you run your first sync.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.mapping.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {log.mapping.targetType} ({log.mapping.targetEntity})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {log.completedAt ? formatDate(log.completedAt) : "Running..."}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDuration(log.startedAt, log.completedAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {log.rowsProcessed} rows
                      </p>
                      {log.rowsFailed > 0 && (
                        <p className="text-xs text-red-600">
                          {log.rowsFailed} failed
                        </p>
                      )}
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
