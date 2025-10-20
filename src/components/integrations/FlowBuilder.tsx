"use client";

import { useMemo, useState } from "react";
import { registry, type ProviderConfig } from "@/lib/integrations/registry";

type Props = { current: ProviderConfig };

export default function FlowBuilder({ current }: Props) {
  const [toKey, setToKey] = useState("");

  const possibleTargets = useMemo(() => {
    const set = new Set<string>();
    current.capability.flows.forEach(f => set.add(f.to));
    return Array.from(set);
  }, [current]);

  const availableFlows = useMemo(() => {
    if (!toKey) return [] as { entities: string[]; description?: string }[];
    return current.capability.flows.filter(f => f.to === toKey).map(f => ({ entities: f.entities, description: f.description }));
  }, [current, toKey]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Flows</h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-700">From</span>
        <span className="text-sm font-medium text-gray-900">{current.name}</span>
        <span className="text-sm text-gray-700">to</span>
        <select
          value={toKey}
          onChange={(e) => setToKey(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Select destination...</option>
          {possibleTargets.map(key => {
            const p = registry.find(r => r.key === key)!;
            return (
              <option key={key} value={key}>{p.name}</option>
            );
          })}
        </select>
      </div>
      {toKey ? (
        <div className="space-y-2">
          {availableFlows.map((f, idx) => (
            <div key={idx} className="p-3 border border-gray-200 rounded-md">
              <div className="text-xs text-gray-500 mb-1">Entities</div>
              <div className="flex flex-wrap gap-2">
                {f.entities.map(e => (
                  <span key={e} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{e}</span>
                ))}
              </div>
              {f.description && (
                <div className="mt-2 text-xs text-gray-600">{f.description}</div>
              )}
            </div>
          ))}
          {availableFlows.length === 0 && (
            <div className="text-sm text-gray-600">No predefined flows for this destination yet.</div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600">Select a destination provider to view supported flows.</div>
      )}
    </div>
  );
}


