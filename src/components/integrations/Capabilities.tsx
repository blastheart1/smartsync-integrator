"use client";

import type { ProviderConfig } from "@/lib/integrations/registry";

type Props = { provider: ProviderConfig };

export default function Capabilities({ provider }: Props) {
  const { capability } = provider;
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Datapoints</h3>
        <div className="flex flex-wrap gap-2">
          {capability.entities.map(e => (
            <span key={e} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{e}</span>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Triggers</h3>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          {capability.triggers.map(t => (<li key={t}>{t}</li>))}
        </ul>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          {capability.actions.map(a => (<li key={a}>{a}</li>))}
        </ul>
      </div>
    </div>
  );
}


