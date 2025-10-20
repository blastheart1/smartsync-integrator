"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Home
} from "lucide-react";
import Link from "next/link";
import GoogleSheetsBrowser from "@/components/integrations/GoogleSheetsBrowser";
import GoogleSheetsOperations from "@/components/integrations/GoogleSheetsOperations";
import SyncMonitoring from "@/components/integrations/SyncMonitoring";
import GoogleAccountManager from "@/components/integrations/GoogleAccountManager";

interface GoogleAccount {
  id: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

interface Spreadsheet {
  id: string;
  name: string;
  url: string;
  lastModified: string;
  owner: string;
  size: number;
}

interface IntegrationMapping {
  id: string;
  name: string;
  sourceSpreadsheetId: string;
  targetType: string;
  targetEntity: string;
  isActive: boolean;
  lastSync?: string;
  syncCount: number;
  syncFrequency: string;
}

function GoogleSheetsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [mappings, setMappings] = useState<IntegrationMapping[]>([]);
  const [selectedMappingForMonitoring, setSelectedMappingForMonitoring] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<Spreadsheet | undefined>(undefined);
  const [showOperationsForSheet, setShowOperationsForSheet] = useState<string | null>(null);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [selectedMappings, setSelectedMappings] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  useEffect(() => {
    fetchDashboardData();
    
    // Check for OAuth callback parameters
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (connected === 'true') {
      // Show success message
      console.log('Google account connected successfully');
    } else if (error) {
      setError(`Connection failed: ${error}`);
    }
  }, [searchParams]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch accounts, spreadsheets, and mappings in parallel
      const [accountsRes, spreadsheetsRes, mappingsRes] = await Promise.allSettled([
        fetch('/api/integrations/googlesheets/accounts'),
        fetch('/api/integrations/googlesheets/spreadsheets'),
        fetch('/api/integrations/googlesheets/mappings')
      ]);
      
      if (accountsRes.status === 'fulfilled' && accountsRes.value.ok) {
        const accountsData = await accountsRes.value.json();
        setAccounts(accountsData.data || []);
      }
      
      if (spreadsheetsRes.status === 'fulfilled' && spreadsheetsRes.value.ok) {
        const spreadsheetsData = await spreadsheetsRes.value.json();
        setSpreadsheets(spreadsheetsData.data || []);
      }
      
      if (mappingsRes.status === 'fulfilled' && mappingsRes.value.ok) {
        const mappingsData = await mappingsRes.value.json();
        setMappings(mappingsData.data || []);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = () => {
    window.location.href = '/api/integrations/googlesheets/auth';
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      const response = await fetch('/api/integrations/googlesheets/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      } else {
        setError('Failed to disconnect account');
      }
    } catch (error) {
      setError('Failed to disconnect account');
    }
  };

  const handleToggleMappingActive = async (mappingId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/integrations/googlesheets/mappings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: mappingId,
          isActive: !isActive
        })
      });
      
      if (response.ok) {
        // Update local state
        setMappings(mappings.map(m => 
          m.id === mappingId ? { ...m, isActive: !isActive } : m
        ));
      } else {
        setError('Failed to update mapping status');
      }
    } catch (err) {
      setError('Failed to update mapping status');
    }
  };

  const handleReadData = (spreadsheet: Spreadsheet) => {
    setSelectedSpreadsheet(spreadsheet);
    setShowOperationsForSheet(spreadsheet.id);
    setActiveTab("operations");
  };

  const handleCreateIntegration = (spreadsheet: Spreadsheet) => {
    setSelectedSpreadsheet(spreadsheet);
    router.push('/integrations/googlesheets/create');
  };

  const handleSetActiveAccount = async (accountId: string) => {
    try {
      const response = await fetch('/api/integrations/googlesheets/accounts/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      if (response.ok) {
        // Update local state to reflect the change
        setAccounts(accounts.map(acc => ({
          ...acc,
          isActive: acc.id === accountId
        })));
      } else {
        setError('Failed to switch active account');
      }
    } catch (err) {
      setError('Failed to switch active account');
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (window.confirm("Are you sure you want to delete this integration? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/integrations/googlesheets/mappings?id=${mappingId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Update local state to remove the deleted mapping
          setMappings(mappings.filter(m => m.id !== mappingId));
        } else {
          setError('Failed to delete integration');
        }
      } catch (err) {
        setError('Failed to delete integration');
      }
    }
  };

  const handleSelectMapping = (mappingId: string, selected: boolean) => {
    if (selected) {
      setSelectedMappings([...selectedMappings, mappingId]);
    } else {
      setSelectedMappings(selectedMappings.filter(id => id !== mappingId));
    }
  };

  const handleSelectAllMappings = (selected: boolean) => {
    if (selected) {
      setSelectedMappings(mappings.map(m => m.id));
    } else {
      setSelectedMappings([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMappings.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedMappings.length} integration(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = selectedMappings.map(mappingId => 
          fetch(`/api/integrations/googlesheets/mappings?id=${mappingId}`, {
            method: 'DELETE'
          })
        );
        
        await Promise.all(deletePromises);
        
        // Update local state to remove deleted mappings
        setMappings(mappings.filter(m => !selectedMappings.includes(m.id)));
        setSelectedMappings([]);
      } catch (err) {
        setError('Failed to delete integrations');
      }
    }
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedMappings.length === 0) return;
    
    try {
      const updatePromises = selectedMappings.map(mappingId => 
        fetch('/api/integrations/googlesheets/mappings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: mappingId, isActive })
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setMappings(mappings.map(m => 
        selectedMappings.includes(m.id) ? { ...m, isActive } : m
      ));
      setSelectedMappings([]);
    } catch (err) {
      setError('Failed to update integrations');
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "spreadsheets", label: "Spreadsheets" },
    { id: "integrations", label: "Integrations" },
    { id: "operations", label: "Operations" },
    { id: "logs", label: "Logs" }
  ];

  const activeAccounts = accounts.filter(acc => acc.isActive);
  const totalRowsSynced = mappings.reduce((sum, mapping) => sum + mapping.syncCount, 0);
  const lastSync = mappings.length > 0 ? 
    new Date(Math.max(...mappings.filter(m => m.lastSync).map(m => new Date(m.lastSync!).getTime())))
      .toLocaleString() : 'Never';

  // Filter mappings based on search and filters
  const filteredMappings = useMemo(() => {
    return mappings.filter(mapping => {
      const matchesSearch = mapping.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && mapping.isActive) ||
        (statusFilter === "inactive" && !mapping.isActive);
      const matchesTargetType = targetTypeFilter === "all" || mapping.targetType === targetTypeFilter;
      
      return matchesSearch && matchesStatus && matchesTargetType;
    });
  }, [mappings, searchQuery, statusFilter, targetTypeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Google Sheets Integration</h1>
                <p className="text-gray-600 mt-1">Connect and sync your Google Sheets with other apps</p>
              </div>
            </div>
            {accounts.length > 0 ? (
              <button
                onClick={() => setShowAccountManager(true)}
                className="btn btn-primary btn-md"
              >
                {(() => {
                  const activeAccount = accounts.find(acc => acc.isActive);
                  return activeAccount ? (
                    <>
                      {activeAccount.avatar ? (
                        <img src={activeAccount.avatar} alt={activeAccount.email} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      )}
                      <span className="text-sm">{activeAccount.email}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect Google Account
                    </>
                  );
                })()}
              </button>
            ) : (
              <button
                onClick={handleConnectAccount}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4" />
                Connect Google Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Connected Accounts</p>
                  <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Spreadsheets</p>
                  <p className="text-3xl font-bold text-gray-900">{spreadsheets.length}</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Active Integrations</p>
                  <p className="text-3xl font-bold text-gray-900">{mappings.filter(m => m.isActive).length}</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Rows Synced</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRowsSynced}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-8">
                {mappings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <p className="text-gray-600 text-lg mb-2">No integrations yet</p>
                    <p className="text-gray-600">Create your first integration to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mappings.slice(0, 5).map((mapping) => (
                      <div key={mapping.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${mapping.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <p className="font-medium text-gray-900">{mapping.name}</p>
                            <p className="text-sm text-gray-600">
                              Google Sheets → {mapping.targetType} ({mapping.targetEntity})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {mapping.lastSync ? new Date(mapping.lastSync).toLocaleString() : 'Never synced'}
                          </p>
                          <p className="text-xs text-gray-500">{mapping.syncCount} rows</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === "spreadsheets" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Spreadsheets</h3>
                    {selectedSpreadsheet && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: <span className="font-medium text-gray-900">{selectedSpreadsheet.name}</span>
                      </p>
                    )}
                  </div>
                  
                  {selectedSpreadsheet && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReadData(selectedSpreadsheet)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                        Read Data
                      </button>
                      <button
                        onClick={() => handleCreateIntegration(selectedSpreadsheet)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                        Create Integration
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8">
                <GoogleSheetsBrowser
                  spreadsheets={spreadsheets}
                  loading={loading}
                  onSelect={setSelectedSpreadsheet}
                  selectedId={selectedSpreadsheet?.id}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-8">
            {selectedMappingForMonitoring ? (
              // Show monitoring view for selected mapping
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setSelectedMappingForMonitoring(null)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    Back to Integrations
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mappings.find(m => m.id === selectedMappingForMonitoring)?.name}
                  </h3>
                </div>
                
                <SyncMonitoring
                  mappingId={selectedMappingForMonitoring}
                  mappingName={mappings.find(m => m.id === selectedMappingForMonitoring)?.name || ""}
                  targetType={mappings.find(m => m.id === selectedMappingForMonitoring)?.targetType || ""}
                  targetEntity={mappings.find(m => m.id === selectedMappingForMonitoring)?.targetEntity || ""}
                  isActive={mappings.find(m => m.id === selectedMappingForMonitoring)?.isActive || false}
                  onToggleActive={() => {
                    const mapping = mappings.find(m => m.id === selectedMappingForMonitoring);
                    if (mapping) {
                      handleToggleMappingActive(mapping.id, mapping.isActive);
                    }
                  }}
                />
              </div>
            ) : (
              // Show integrations list
              <div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">Integration Mappings</h3>
                    {mappings.length > 0 && (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedMappings.length === filteredMappings.length && filteredMappings.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMappings(filteredMappings.map(m => m.id));
                            } else {
                              setSelectedMappings([]);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        Select All
                      </label>
                    )}
                  </div>
                  <button 
                    onClick={() => router.push('/integrations/googlesheets/create')}
                    className="btn btn-primary btn-lg mb-6"
                  >
                    <Plus className="w-4 h-4" />
                    Create Integration
                  </button>
                </div>

                {/* Bulk Actions Bar */}
                {selectedMappings.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-blue-900 font-medium">
                        {selectedMappings.length} integration{selectedMappings.length !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBulkToggleActive(true)}
                          className="text-green-700 hover:text-green-800 text-sm font-medium px-3 py-1 rounded hover:bg-green-100 transition-colors"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleBulkToggleActive(false)}
                          className="text-orange-700 hover:text-orange-800 text-sm font-medium px-3 py-1 rounded hover:bg-orange-100 transition-colors"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="text-red-700 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMappings([])}
                      className="text-blue-700 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
                {/* Search and Filter Controls */}
                {mappings.length > 0 && (
                  <div className="mt-6 mb-8">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-8">
                        <input
                          type="text"
                          placeholder="Search integrations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={targetTypeFilter}
                          onChange={(e) => setTargetTypeFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Targets</option>
                          <option value="quickbooks">QuickBooks</option>
                          <option value="hubspot">HubSpot</option>
                          <option value="salesforce">Salesforce</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

            
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="p-8">
                {mappings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <p className="text-gray-600 text-lg mb-2">No integrations created yet</p>
                    <p className="text-gray-600">Create integrations to sync data between Google Sheets and other apps.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMappings.map((mapping) => (
                      <div key={mapping.id} className="border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedMappings.includes(mapping.id)}
                              onChange={(e) => handleSelectMapping(mapping.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <h4 className="font-medium text-gray-900 text-lg">{mapping.name}</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              mapping.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {mapping.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm mb-4">
                          <div>
                            <p className="text-gray-600 mb-1">Source</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">Google Sheets</p>
                              {mapping.sourceSpreadsheetId && (
                                <button
                                  onClick={() => {
                                    // Find the spreadsheet URL from the spreadsheet ID
                                    const sourceSheet = spreadsheets.find(s => s.id === mapping.sourceSpreadsheetId);
                                    if (sourceSheet) {
                                      window.open(sourceSheet.url, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                                  title="View Source Sheet"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Target</p>
                            <p className="font-medium text-gray-900">{mapping.targetType} ({mapping.targetEntity})</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Frequency</p>
                            <p className="font-medium text-gray-900 capitalize">{mapping.syncFrequency}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Last Sync</p>
                            <p className="font-medium text-gray-900">
                              {mapping.lastSync ? new Date(mapping.lastSync).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            {mapping.syncCount} rows synced
                          </span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteMapping(mapping.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                            <button 
                              onClick={() => setSelectedMappingForMonitoring(mapping.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              Monitor
                            </button>
                            <button className="text-green-600 hover:text-green-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-green-50 transition-colors">
                              Test Sync
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
            )}
          </div>
        )}

        {activeTab === "operations" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Manual Operations</h3>
                {selectedSpreadsheet && (
                  <p className="text-sm text-gray-600 mt-1">
                    Working with: <span className="font-medium text-gray-900">{selectedSpreadsheet.name}</span>
                  </p>
                )}
              </div>
              <div className="p-8">
                <GoogleSheetsOperations
                  selectedSpreadsheet={selectedSpreadsheet}
                  spreadsheets={spreadsheets}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
              </div>
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 text-lg mb-2">Activity logs coming soon</p>
                  <p className="text-gray-500">View sync history, errors, and performance metrics.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Manager Modal */}
      {showAccountManager && (
        <GoogleAccountManager
          accounts={accounts}
          onClose={() => setShowAccountManager(false)}
          onConnectAccount={handleConnectAccount}
          onDisconnectAccount={handleDisconnectAccount}
          onSetActiveAccount={handleSetActiveAccount}
        />
      )}
      
    </div>
  );
}

export default function GoogleSheetsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Sheets...</p>
        </div>
      </div>
    }>
      <GoogleSheetsPageContent />
    </Suspense>
  );
}
