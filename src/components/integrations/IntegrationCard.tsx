"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Users,
  Cloud,
  CreditCard,
  MessageSquare,
  Mail,
  CheckSquare,
  Building,
  Database,
  FolderOpen,
  Wallet,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import type { ProviderConfig } from "@/lib/integrations/registry";

type Props = {
  provider: ProviderConfig;
  onUse?: (key: string) => void;
};

const iconMap: Record<string, any> = {
  Users,
  Cloud,
  CreditCard,
  MessageSquare,
  Mail,
  CheckSquare,
  Building,
  Database,
  FolderOpen,
  Wallet,
  FileSpreadsheet
};

function ProviderIcon({ provider }: { provider: ProviderConfig }) {
  // If icon is a path to public asset, render Image; otherwise lucide icon name
  const isPath = provider.icon.startsWith("/");
  if (isPath) {
    return (
      <Image src={provider.icon} alt={provider.name} width={28} height={28} className="rounded" />
    );
  }
  const Icon = iconMap[provider.icon] ?? Cloud;
  return <Icon className="w-6 h-6 text-gray-700" />;
}

export default function IntegrationCard({ provider, onUse }: Props) {
  const statusLabel =
    provider.status === "available" ? "Available" : provider.status === "beta" ? "Beta" : "Coming Soon";

  const handleClick = () => {
    if (provider.status === "coming_soon") return;
    try {
      const now = Date.now();
      const usageKey = `usage:${provider.key}`;
      const countKey = `usageCount:${provider.key}`;
      localStorage.setItem(usageKey, String(now));
      const prev = Number(localStorage.getItem(countKey) || "0");
      localStorage.setItem(countKey, String(prev + 1));
      onUse?.(provider.key);
    } catch {}
  };

  return (
    <Link 
      href={`/integrations/${provider.key}`} 
      onClick={handleClick} 
      className={`block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl ${provider.status === "coming_soon" ? "pointer-events-none" : ""}`}
      tabIndex={provider.status === "coming_soon" ? -1 : 0}
      aria-disabled={provider.status === "coming_soon"}
    >
      <motion.div
        whileHover={{ y: -2 }}
        className={`rounded-xl border shadow-sm p-5 h-[200px] flex flex-col transition-colors ${
          provider.status === "coming_soon" 
            ? "border-gray-200 bg-gray-50" 
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3 h-12">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ProviderIcon provider={provider} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{provider.name}</div>
              <div className="text-xs text-gray-600 truncate">{provider.category}</div>
            </div>
          </div>
          <span
            className="text-[11px] uppercase font-semibold px-2 py-1 rounded flex-shrink-0 ml-2"
            style={{ background: "#E5E7EB", color: "#1F2937" }}
            role="status"
            aria-label={`Integration status: ${statusLabel}`}
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{provider.description}</p>

        <div className="mt-auto">
          {/* Badges - always show exactly 3, truncate if more */}
          <div className="flex items-center gap-2 mb-3 h-6">
            {provider.capability.entities.slice(0, 3).map((e) => (
              <span key={e} className="text-[11px] bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full truncate max-w-[80px]">
                {e}
              </span>
            ))}
          </div>
          
          {/* Explore button - always on its own line */}
          <div className="flex justify-end h-6">
            <span className="text-xs font-medium text-blue-600">
              {provider.status === "coming_soon" ? "Soon" : "Explore →"}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}


