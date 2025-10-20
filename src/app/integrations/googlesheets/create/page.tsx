"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import IntegrationMapper from "@/components/integrations/IntegrationMapper";

export default function CreateIntegrationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (mapping: any) => {
    try {
      setSaving(true);
      // Integration will be saved by the IntegrationMapper component
      // Redirect back to integrations tab after successful save
      router.push("/integrations/googlesheets?tab=integrations");
    } catch (error) {
      console.error("Failed to save integration:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/integrations/googlesheets?tab=integrations");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Integrations
            </button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <h1 className="text-2xl font-bold text-gray-900">Create Integration</h1>
          </div>
        </div>
      </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto scrollbar-hide max-h-screen">
        <IntegrationMapper
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>
    </div>
  );
}
