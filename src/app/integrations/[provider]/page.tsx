"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { getProviderByKey, registry } from "@/lib/integrations/registry";
import Capabilities from "@/components/integrations/Capabilities";
import FlowBuilder from "@/components/integrations/FlowBuilder";

export default function ProviderPage() {
  const params = useParams();
  const providerKey = String(params?.provider || "");
  const provider = useMemo(() => getProviderByKey(providerKey), [providerKey]);

  if (!provider) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-gray-900 font-medium mb-2">Provider not found</div>
            <Link href="/integrations" className="text-blue-600">Back to integrations</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-bold text-gray-900">{provider.name}</div>
          <Link 
            href="/" 
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <div className="text-lg font-semibold text-gray-900 mb-2">Capabilities</div>
              <Capabilities provider={provider} />
            </div>

            <FlowBuilder current={provider} />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">Connection</div>
              {provider.status === "coming_soon" ? (
                <div className="text-sm text-gray-600">Coming Soon</div>
              ) : (
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Connect</button>
              )}
              <div className="mt-3 text-xs text-gray-600">
                OAuth: {provider.oauth.toUpperCase()} • Category: {provider.category}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">About</div>
              <p className="text-sm text-gray-600">{provider.description}</p>
              {provider.docsUrl && (
                <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-blue-600">Developer docs</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


