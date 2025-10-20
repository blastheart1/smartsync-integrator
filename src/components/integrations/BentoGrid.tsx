"use client";

import { useMemo, useState } from "react";
import IntegrationCard from "./IntegrationCard";
import type { ProviderConfig, registry as registryData, IntegrationCategory } from "@/lib/integrations/registry";
import { getAllCategories } from "@/lib/integrations/registry";

type SortOption = "category" | "lastUsed" | "mostUsed" | "name" | "available";

type Props = {
  providers: ProviderConfig[];
};

function getLocalUsage(providerKey: string) {
  if (typeof window === "undefined") return { lastUsed: 0, useCount: 0 };
  const lastUsed = Number(localStorage.getItem(`usage:${providerKey}`) || "0");
  const useCount = Number(localStorage.getItem(`usageCount:${providerKey}`) || "0");
  return { lastUsed, useCount };
}

export default function BentoGrid({ providers }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("available");
  const [category, setCategory] = useState<IntegrationCategory | "All">("All");

  const categories: (IntegrationCategory | "All")[] = useMemo(() => ["All", ...getAllCategories()], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = providers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.capability.entities.some(e => e.toLowerCase().includes(q))
    );
    if (category !== "All") {
      list = list.filter(p => p.category === category);
    }
    return list;
  }, [providers, query, category]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "available":
        arr.sort((a, b) => {
          // Available first, then beta, then coming soon
          const statusOrder = { "available": 0, "beta": 1, "coming_soon": 2 };
          const aOrder = statusOrder[a.status] ?? 3;
          const bOrder = statusOrder[b.status] ?? 3;
          if (aOrder !== bOrder) return aOrder - bOrder;
          // If same status, sort by name
          return a.name.localeCompare(b.name);
        });
        break;
      case "category":
        arr.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        break;
      case "lastUsed":
        arr.sort((a, b) => getLocalUsage(b.key).lastUsed - getLocalUsage(a.key).lastUsed);
        break;
      case "mostUsed":
        arr.sort((a, b) => getLocalUsage(b.key).useCount - getLocalUsage(a.key).useCount);
        break;
      case "name":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [filtered, sort]);

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {/* Search bar spans 3 columns on xl screens, 2 on lg, full on smaller */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-3">
            <input
              type="text"
              placeholder="Search integrations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Sort controls take 1 column */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="lastUsed">Last used</option>
                <option value="mostUsed">Most used</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((p) => (
          <IntegrationCard key={p.key} provider={p} />
        ))}
      </div>
    </div>
  );
}


