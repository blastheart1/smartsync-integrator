"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";

interface GoogleAccount {
  id: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  lastUsed?: string;
}

interface GoogleAccountSelectorProps {
  userId: string;
  onAccountChange?: (accountId: string) => void;
  className?: string;
}

export default function GoogleAccountSelector({ 
  userId, 
  onAccountChange,
  className = "" 
}: GoogleAccountSelectorProps) {
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/googlesheets/accounts');
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
      } else {
        setError('Failed to load accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = async (accountId: string) => {
    try {
      const response = await fetch('/api/integrations/googlesheets/accounts/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      if (response.ok) {
        // Update local state
        setAccounts(prev => 
          prev.map(acc => ({
            ...acc,
            isActive: acc.id === accountId
          }))
        );
        
        onAccountChange?.(accountId);
        setIsOpen(false);
      } else {
        setError('Failed to switch account');
      }
    } catch (error) {
      console.error('Error switching account:', error);
      setError('Failed to switch account');
    }
  };

  const handleAddAccount = () => {
    window.location.href = '/api/integrations/googlesheets/auth';
  };

  const activeAccount = accounts.find(acc => acc.isActive);

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-800">
          <span className="text-sm font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 mb-4">No Google accounts connected</p>
          <button
            onClick={handleAddAccount}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Account Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        {activeAccount ? (
          <>
            {activeAccount.avatar ? (
              <img 
                src={activeAccount.avatar} 
                alt={activeAccount.email} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activeAccount.email}
              </p>
              <p className="text-xs text-gray-500">Active account</p>
            </div>
          </>
        ) : (
          <div className="flex-1 text-left">
            <p className="text-sm text-gray-500">Select an account</p>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
          <div className="py-2">
            {/* Add Account Option */}
            <button
              onClick={handleAddAccount}
              className="w-full px-4 py-3 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100"
            >
              <Plus className="w-4 h-4" />
              Add Google Account
            </button>
            
            {/* Account List */}
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleAccountSelect(account.id)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-4 transition-colors ${
                  account.isActive ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                }`}
              >
                {account.avatar ? (
                  <img 
                    src={account.avatar} 
                    alt={account.email} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium truncate">{account.email}</p>
                  {account.lastUsed && (
                    <p className="text-xs text-gray-500">
                      Last used: {new Date(account.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {account.isActive && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
