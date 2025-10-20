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
    <Link href={`/integrations/${provider.key}`} onClick={handleClick} className={provider.status === "coming_soon" ? "pointer-events-none" : undefined}>
      <motion.div
        whileHover={{ y: -2 }}
        className={`rounded-xl border border-gray-200 bg-white shadow-sm p-5 h-full flex flex-col transition-colors ${
          provider.status === "coming_soon" ? "opacity-60" : "hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ProviderIcon provider={provider} />
            <div>
              <div className="text-sm font-semibold text-gray-900">{provider.name}</div>
              <div className="text-xs text-gray-500">{provider.category}</div>
            </div>
          </div>
          <span
            className="text-[10px] uppercase font-semibold px-2 py-1 rounded"
            style={{ background: "#F3F4F6", color: "#374151" }}
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{provider.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {provider.capability.entities.slice(0, 3).map((e) => (
              <span key={e} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {e}
              </span>
            ))}
            {provider.capability.entities.length > 3 && (
              <span className="text-[10px] text-gray-500">+{provider.capability.entities.length - 3}</span>
            )}
          </div>
          <span className="text-xs font-medium text-blue-600">{provider.status === "coming_soon" ? "Soon" : "Explore →"}</span>
        </div>
      </motion.div>
    </Link>
  );
}


