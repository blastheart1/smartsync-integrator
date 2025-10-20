"use client";

import { useState } from "react";
import { X, CheckCircle, Plus, User } from "lucide-react";

interface GoogleAccount {
  id: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

interface GoogleAccountManagerProps {
  accounts: GoogleAccount[];
  onClose: () => void;
  onConnectAccount: () => void;
  onDisconnectAccount: (accountId: string) => void;
  onSetActiveAccount: (accountId: string) => void;
}

export default function GoogleAccountManager({
  accounts,
  onClose,
  onConnectAccount,
  onDisconnectAccount,
  onSetActiveAccount
}: GoogleAccountManagerProps) {
  const [disconnectingAccount, setDisconnectingAccount] = useState<string | null>(null);

  const handleDisconnect = async (accountId: string) => {
    if (window.confirm("Are you sure you want to disconnect this account? This will remove all associated data.")) {
      setDisconnectingAccount(accountId);
      try {
        await onDisconnectAccount(accountId);
      } finally {
        setDisconnectingAccount(null);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Manage Google Accounts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg p-1"
            aria-label="Close account manager"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-hide max-h-[70vh]">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-4">No Google accounts connected yet</p>
              <p className="text-gray-500 mb-6">Connect a Google account to start syncing your spreadsheets</p>
              <button
                onClick={onConnectAccount}
                className="btn btn-primary btn-lg mx-auto"
              >
                <Plus className="w-4 h-4" />
                Connect Google Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {account.avatar ? (
                      <img src={account.avatar} alt={account.email} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-lg">{account.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {account.isActive && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        )}
                        <span className="text-sm text-gray-600">
                          Connected {new Date(account.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!account.isActive && (
                      <button
                        onClick={() => onSetActiveAccount(account.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(account.id)}
                      disabled={disconnectingAccount === account.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      {disconnectingAccount === account.id ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add Account Button */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={onConnectAccount}
                  className="btn btn-primary btn-lg w-full"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}
